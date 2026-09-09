/**
 * cognitive-os.test.ts — the Phase 1 deterministic battery.
 *
 * Run:  npx tsx src/lib/cognitive-os/__tests__/cognitive-os.test.ts
 * ALSO: npx tsc --noEmit ... on this file — §9's pins are COMPILE-TIME and tsx
 *       does not typecheck. Running only tsx would make those pins vacuous.
 *
 * Covers spec §24's deterministic test requirements (belief revision, temporal
 * integrity, epistemic debt, handoffs, threshold, recovery) AND every binding
 * constraint C1–C9 and spec Constraints 1–10.
 *
 * Test discipline applied, per this project's hard-won lessons:
 *   - Assert on the STRENGTH of a constraint, not merely its presence.
 *   - Every load-bearing pin is mutation-verified (recorded in the session report).
 *   - A NON-VACUITY FLOOR at the end: a guard that stops guarding still prints
 *     "0 failed", so the count of assertions actually run is itself asserted.
 *   - Source-grep pins STRIP COMMENTS FIRST — a constraint satisfied only by a
 *     comment mentioning it is not satisfied.
 *
 * HERMETIC: the Supabase env is deleted up front (the S9b lesson).
 */

const SAVED_ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import {
  createDeterministicClock,
  CONFIDENCE_ORDINAL,
  CONFIDENCE_RANK,
  NOT_YET_ASSESSED,
  weakestConfidence,
  epistemicDebtScore,
  identityCoherenceScore,
  carriedProximityRank,
  INTERNAL_ONLY_SCALAR_KINDS,
} from '../types'
import {
  createClaim,
  attestEvidence,
  phase1UnverifiedAuthority,
  allEvidenceGenuinelyVerified,
  deriveConfidence,
  deriveUncertaintyBand,
  isSupporting,
  EPISTEMIC_STATUSES,
  type EvidenceRef,
  type ClaimProvenance,
  type CreateClaimInput,
} from '../claim'
import { EventStore, EVENT_TYPES, ImmutableHistoryError } from '../event-store'
import { DependencyGraph } from '../dependency-graph'
import {
  createBeliefState,
  withClaim,
  nextVersion,
  deriveEpistemicDebtScore,
  EMPTY_DEBT,
} from '../belief-state'
import { analyseResolution, analyseStaleness } from '../truth-maintenance'
import {
  retractClaim,
  reinstateClaim,
  surfaceClaim,
  registerEvidence,
  propagateInvalidation,
  commitDecision,
  markDecisionForReview,
  deriveDecisionStatus,
  ReinstatementRefusedError,
} from '../belief-revision'
import {
  scanForEgress,
  PERMISSION_SCOPES,
  PERMISSION_VERBS,
  PERMISSION_GRANTS,
  WRITE_VERBS,
  isPermitted,
  assertPermitted,
  PermissionDeniedError,
  routingScoreWriters,
  findInternalOnlyScores,
  assertNoInternalScoreEgress,
  InternalScoreEgressError,
} from '../permissions'
import {
  createHandoffEnvelope,
  validateHandoff,
  toExternalView,
  sendExternally,
} from '../handoff-envelope'

let passed = 0
let failed = 0
const failures: string[] = []
function check(label: string, ok: boolean): void {
  if (ok) passed++
  else {
    failed++
    failures.push(label)
    console.error(`  FAIL  ${label}`)
  }
}
function threw(fn: () => unknown, Kind?: new (...a: any[]) => Error): boolean {
  try {
    fn()
    return false
  } catch (e) {
    return Kind === undefined || e instanceof Kind
  }
}

const LIB_DIR = join(__dirname, '..')
/** Read a library file with block and line comments STRIPPED — a constraint that
 *  is only mentioned in a comment is not enforced by anything. */
function sourceWithoutComments(file: string): string {
  const raw = readFileSync(join(LIB_DIR, file), 'utf8')
  return raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}
const LIB_FILES = readdirSync(LIB_DIR).filter((f) => f.endsWith('.ts'))

const AUTH = phase1UnverifiedAuthority('battery-harness')
const verified = (id: string): EvidenceRef => attestEvidence(id, 'verified', AUTH)
const unverified = (id: string): EvidenceRef => attestEvidence(id, 'unverified', AUTH)
const contradicted = (id: string): EvidenceRef => attestEvidence(id, 'contradicted', AUTH)
const prov = (ev: EvidenceRef[], sources: string[] = ['s1']): ClaimProvenance => ({
  source_ids: sources,
  evidence_ids: ev,
  created_by: 'test',
  created_at: '2026-01-01T00:00:00.000Z',
})

// ============================================================================
console.log('\n§1  BELIEF REVISION — creation, evidence, retraction, propagation,')
console.log('    reinstatement, stale detection (spec §24)')
// ============================================================================
{
  const clock = createDeterministicClock()
  const store = new EventStore(clock)
  let state = createBeliefState(clock)

  const c = createClaim(
    { content: 'x', provenance: prov([verified('e1')]), dependency_graph_id: 'g', belief_state_id: state.belief_state_id, belief_state_version: state.version },
    clock,
  )
  check('§1.1 claim created with derived ordinal confidence', c.confidence === 'weak')
  check('§1.1 claim is frozen', Object.isFrozen(c))
  const e0 = store.append({ event_type: 'OBSERVE', scope: 'Laboratory', caused_by: 't', reason: 'r', claim_id: c.claim_id })
  state = withClaim(state, c, e0.event_id, clock)

  const ev = registerEvidence(state, c.claim_id, verified('e2'), { scope: 'Laboratory', caused_by: 't', reason: 'more' }, store, clock)
  check('§1.2 adding a second verified evidence raised confidence weak → moderate',
    ev.claim.confidence === 'moderate')
  state = ev.state

  const ret = retractClaim(state, c.claim_id, { scope: 'Laboratory', caused_by: 't', reason: 'bad' }, store, clock)
  state = ret.state
  check('§1.3 retraction set status retracted',
    state.claims[0].epistemic_status === 'retracted')
  check('§1.3 retraction recorded the claim in unresolved_claims debt',
    state.epistemic_debt.unresolved_claims.includes(c.claim_id))

  // §1.4 reinstatement REQUIRES a warrant with verified evidence (Constraint 6)
  check('§1.4 reinstatement REFUSED without verified evidence in the warrant',
    threw(() => reinstateClaim(state, c.claim_id, { evidence: [unverified('e9')], rationale: 'hope' },
      { scope: 'Laboratory', caused_by: 't' }, store, clock), ReinstatementRefusedError))
  check('§1.4 reinstatement REFUSED on an EMPTY warrant',
    threw(() => reinstateClaim(state, c.claim_id, { evidence: [], rationale: 'none' },
      { scope: 'Laboratory', caused_by: 't' }, store, clock), ReinstatementRefusedError))
  const rein = reinstateClaim(state, c.claim_id, { evidence: [verified('e10')], rationale: 'established' },
    { scope: 'Laboratory', caused_by: 't' }, store, clock)
  check('§1.4 reinstatement SUCCEEDS on a warrant carrying verified evidence',
    rein.state.claims[0].epistemic_status === 'reinstated')
  check('§1.4 reinstatement cleared the claim from unresolved_claims',
    !rein.state.epistemic_debt.unresolved_claims.includes(c.claim_id))

  // §1.5 Constraint 6 — SURFACING IS NOT REINSTATEMENT
  const before = JSON.stringify(state.claims[0])
  const surf = surfaceClaim(state, c.claim_id, { scope: 'Attic', caused_by: 'attic' }, store)
  check('§1.5 Attic may SURFACE a retracted claim (a READ)', surf.claim !== undefined)
  check('§1.5 surfacing changed NOTHING about the claim (Constraint 6)',
    JSON.stringify(state.claims[0]) === before)
  check('§1.5 Attic CANNOT reinstate — it holds no REVISE verb',
    threw(() => reinstateClaim(state, c.claim_id, { evidence: [verified('e11')], rationale: 'r' },
      { scope: 'Attic', caused_by: 'attic' }, store, clock), PermissionDeniedError))
}
{
  // §1.6 stale detection + propagation through the graph
  const clock = createDeterministicClock()
  const store = new EventStore(clock)
  const g = new DependencyGraph()
  let state = createBeliefState(clock)
  const mk = (content: string) => {
    const cl = createClaim({ content, provenance: prov([verified('e')]), dependency_graph_id: 'g', belief_state_id: state.belief_state_id, belief_state_version: state.version }, clock)
    const e = store.append({ event_type: 'OBSERVE', scope: 'Laboratory', caused_by: 't', reason: 'r', claim_id: cl.claim_id })
    state = withClaim(state, cl, e.event_id, clock)
    return cl
  }
  const a = mk('a'), b = mk('b'), d = mk('d')
  g.addNode({ node_id: 'A', kind: 'claim' }); g.addNode({ node_id: 'B', kind: 'claim' }); g.addNode({ node_id: 'D', kind: 'claim' })
  g.addEdge('A', 'B'); g.addEdge('B', 'D')
  const p = propagateInvalidation(state, 'A', g,
    { nodeToClaim: (n) => (n === 'A' ? a.claim_id : n === 'B' ? b.claim_id : n === 'D' ? d.claim_id : undefined), nodeToDecision: () => undefined },
    { scope: 'Laboratory', caused_by: 't', reason: 'A gone' }, store, clock)
  check('§1.6 propagation reached BOTH the direct and the TRANSITIVE dependent',
    p.staleClaims.length === 2 && p.staleClaims.includes(b.claim_id) && p.staleClaims.includes(d.claim_id))
  check('§1.6 propagation did NOT mark the invalidated node itself',
    !p.staleClaims.includes(a.claim_id))
  check('§1.6 debt rose by exactly the number of stale claims',
    p.state.epistemic_debt.pending_revisions.length === 2)

  // cycle safety — a graph with a cycle must terminate and yield each node once
  const gc = new DependencyGraph()
  gc.addNode({ node_id: 'X', kind: 'claim' }); gc.addNode({ node_id: 'Y', kind: 'claim' })
  gc.addEdge('X', 'Y'); gc.addEdge('Y', 'X')
  const dep = gc.transitiveDependents('X')
  check('§1.6 CYCLE SAFETY — a 2-cycle terminates; X is NOT its own dependent',
    dep.length === 1 && dep[0] === 'Y')
  const g3 = new DependencyGraph()
  g3.addNode({ node_id: 'P', kind: 'claim' }); g3.addNode({ node_id: 'Q', kind: 'claim' }); g3.addNode({ node_id: 'R', kind: 'claim' })
  g3.addEdge('P', 'Q'); g3.addEdge('Q', 'R'); g3.addEdge('R', 'P')
  const dep3 = g3.transitiveDependents('P')
  check('§1.6 CYCLE SAFETY — a 3-cycle terminates, yields each other node exactly once, excludes the origin',
    dep3.length === 2 && new Set(dep3).size === 2 && !dep3.includes('P') &&
      dep3.includes('Q') && dep3.includes('R'))
  check('§1.6 CYCLE SAFETY — transitiveSupports is cycle-safe in the same way',
    g3.transitiveSupports('P').length === 2 && !g3.transitiveSupports('P').includes('P'))
  check('§1.6 an edge to an unknown node is REFUSED (silent incompleteness is the failure mode)',
    threw(() => gc.addEdge('X', 'NOPE')))
}

// ============================================================================
console.log('§2  TEMPORAL INTEGRITY — versions, immutability, reconstruction, replay')
// ============================================================================
{
  const clock = createDeterministicClock()
  const store = new EventStore(clock)
  let state = createBeliefState(clock)
  const v0 = state.version
  const e1 = store.append({ event_type: 'OBSERVE', scope: 'Laboratory', caused_by: 't', reason: 'r', previous_state_version: 1, new_state_version: 2 })
  state = nextVersion(state, e1.event_id, {}, clock)
  check('§2.1 version increments', state.version === v0 + 1)
  check('§2.1 the revision event id is recorded on the new state',
    state.revision_events.includes(e1.event_id))

  const e2 = store.append({ event_type: 'CORRECT', scope: 'Laboratory', caused_by: 't', reason: 'r', previous_state_version: 2, new_state_version: 3 })
  const state2 = nextVersion(state, e2.event_id, {}, clock)
  check('§2.2 the PRIOR state value is unchanged by producing a successor (Constraint 2)',
    state.version === v0 + 1 && state.revision_events.length === 1)
  check('§2.2 states are frozen', Object.isFrozen(state) && Object.isFrozen(state2))

  check('§2.3 events are frozen', store.all().every((e) => Object.isFrozen(e)))
  check('§2.3 the store exposes NO update/delete path',
    !('update' in store) && !('delete' in store) && !('replace' in store))
  const snapshot = JSON.stringify(store.all())
  const returned = store.all() as any
  try { returned.push({ forged: true }) } catch { /* frozen — expected */ }
  check('§2.3 mutating the array returned by all() cannot alter the log',
    JSON.stringify(store.all()) === snapshot)

  check('§2.4 seq is strictly monotonic',
    store.all().every((e, i, arr) => i === 0 || e.seq > arr[i - 1].seq))
  check('§2.4 versionAt() reconstructs state version FROM EVENTS ALONE',
    store.versionAt(e1.seq) === 2 && store.versionAt(e2.seq) === 3)
  check('§2.5 replayTo() returns a strict historical prefix',
    store.replayTo(e1.seq).length === 1 && store.all().length === 2)

  // a dangling causal dependency must be refused — an unreconstructable trajectory
  check('§2.6 a causal dependency on a non-existent event is REFUSED',
    threw(() => store.append({ event_type: 'INFER', scope: 'Laboratory', caused_by: 't', reason: 'r', causal_dependencies: ['evt-nope'] }), ImmutableHistoryError))
}

// ============================================================================
console.log('§3  EPISTEMIC DEBT — structured object authoritative, score a summary')
// ============================================================================
{
  check('§3.1 empty debt scores zero', deriveEpistemicDebtScore(EMPTY_DEBT).value === 0)
  const debt = { ...EMPTY_DEBT, unresolved_claims: ['c1'], contradictions: [['a', 'b'] as const], stale_evidence: ['e'] }
  check('§3.1 the score counts every debt category', deriveEpistemicDebtScore(debt).value === 3)
  check('§3.2 the score is a WRAPPER OBJECT, not a raw number (C5)',
    typeof deriveEpistemicDebtScore(debt) === 'object' &&
      deriveEpistemicDebtScore(debt).kind === 'epistemic_debt_score')
  const clock = createDeterministicClock()
  const st = createBeliefState(clock)
  const e = new EventStore(clock).append({ event_type: 'CORRECT', scope: 'Laboratory', caused_by: 't', reason: 'r' })
  const withDebt = nextVersion(st, e.event_id, { epistemic_debt: debt }, clock)
  check('§3.3 the summary score is RE-DERIVED on every version — it cannot drift',
    withDebt.summary_scores.epistemic_debt_score.value === 3)
  check('§3.3 the structured debt survives intact alongside the summary (Constraint 4)',
    withDebt.epistemic_debt.unresolved_claims.length === 1 &&
      withDebt.epistemic_debt.contradictions.length === 1)
  check('§3.4 there is NO setter for the summary score anywhere in the library',
    LIB_FILES.every((f) => !/summary_scores\s*\.\s*epistemic_debt_score\s*=/.test(sourceWithoutComments(f))))
}

// ============================================================================
console.log('§4  CONFIDENCE — ordinal (C3), provenance-derived only (C4)')
// ============================================================================
{
  check('§4.1 the scale is ordinal strings, never numbers',
    CONFIDENCE_ORDINAL.every((c) => typeof c === 'string'))
  check('§4.2 no evidence at all reads not_yet_assessed, NOT unsupported',
    deriveConfidence(prov([])) === NOT_YET_ASSESSED)
  check('§4.2 evidence present but none verified reads unsupported (examined, supports nothing)',
    deriveConfidence(prov([unverified('a'), unverified('b')])) === 'unsupported')
  check('§4.3 ANY contradicted evidence drives confidence to unsupported regardless of volume',
    deriveConfidence(prov([verified('a'), verified('b'), verified('c'), verified('d'), contradicted('x')], ['s1', 's2'])) === 'unsupported')
  check('§4.4 confidence rises monotonically with verified evidence',
    CONFIDENCE_RANK[deriveConfidence(prov([verified('a')])) as 'weak'] <
      CONFIDENCE_RANK[deriveConfidence(prov([verified('a'), verified('b')])) as 'moderate'])
  check('§4.5 SINGLE-SOURCE CEILING — volume from one source cannot reach established',
    deriveConfidence(prov([verified('a'), verified('b'), verified('c'), verified('d')], ['only-one'])) === 'strong')
  check('§4.5 two sources with the same volume DO reach established (the ceiling is not blanket)',
    deriveConfidence(prov([verified('a'), verified('b'), verified('c'), verified('d')], ['s1', 's2'])) === 'established')
  check('§4.6 uncertainty band widens DOWNWARD when unverified evidence is present',
    deriveUncertaintyBand(prov([verified('a'), verified('b'), unverified('u')]), 'moderate')?.lower === 'weak')
  check('§4.6 no band is produced around an unmeasured confidence',
    deriveUncertaintyBand(prov([]), NOT_YET_ASSESSED) === undefined)
  check('§4.7 weakestConfidence takes the WEAKEST, never a mean',
    weakestConfidence(['established', 'weak', 'strong']) === 'weak')
  check('§4.7 any unmeasured input makes the whole reading unmeasured — silence never strengthens',
    weakestConfidence(['established', NOT_YET_ASSESSED]) === NOT_YET_ASSESSED)
  check('§4.8 C4 — deriveConfidence reads ONLY verification, never a caller value',
    !/agent|supplied|asserted/i.test(
      sourceWithoutComments('claim.ts').split('export function deriveConfidence')[1]?.split('export function')[0] ?? 'agent'))
}

// ============================================================================
console.log('§5  PERMISSIONS — machine-enforced, fail-closed (spec §17)')
// ============================================================================
{
  check('§5.1 Laboratory may REVISE a claim', isPermitted('Laboratory', 'REVISE', 'claim'))
  check('§5.1 Laboratory may NOT COMMIT a decision (Constraint 7)',
    !isPermitted('Laboratory', 'COMMIT', 'decision'))
  check('§5.1 Laboratory may NOT touch identity (spec §17)',
    !isPermitted('Laboratory', 'UPDATE', 'identity'))
  check('§5.2 Threshold ALONE holds COMMIT on decision',
    PERMISSION_SCOPES.filter((s) => isPermitted(s, 'COMMIT', 'decision')).length === 1 &&
      isPermitted('Threshold', 'COMMIT', 'decision'))
  check('§5.3 Attic holds NO write verb on ANY resource (Constraint 6, structural)',
    Object.values(PERMISSION_GRANTS.Attic).every((verbs) => (verbs ?? []).every((v) => !WRITE_VERBS.includes(v))))
  check('§5.3 Archive holds NO write verb on ANY resource (a reconstructor cannot rewrite)',
    Object.values(PERMISSION_GRANTS.Archive).every((verbs) => (verbs ?? []).every((v) => !WRITE_VERBS.includes(v))))
  check('§5.4 FAIL-CLOSED on an unknown scope', !isPermitted('Cellar', 'READ', 'claim'))
  check('§5.4 FAIL-CLOSED on an unknown verb', !isPermitted('Laboratory', 'DESTROY', 'claim'))
  check('§5.4 FAIL-CLOSED on an unknown resource', !isPermitted('Laboratory', 'READ', 'nuclear_codes'))
  check('§5.4 FAIL-CLOSED on an unlisted resource for a known scope',
    !isPermitted('Attic', 'READ', 'identity'))
  check('§5.5 assertPermitted throws PermissionDeniedError',
    threw(() => assertPermitted('Attic', 'RETRACT', 'claim'), PermissionDeniedError))

  // C7 — checked by the helper AND by an INDEPENDENT re-walk of the table, so a
  // bug in the helper cannot make the constraint merely appear satisfied.
  check('§5.6 C7 — routingScoreWriters() reports no writers', routingScoreWriters().length === 0)
  let independentOffenders = 0
  for (const s of PERMISSION_SCOPES) {
    for (const v of PERMISSION_VERBS) {
      if (v !== 'READ' && isPermitted(s, v, 'routing_score')) independentOffenders++
    }
  }
  check('§5.6 C7 — INDEPENDENT re-walk confirms no scope may write routing_score',
    independentOffenders === 0)
  check('§5.6 C7 — and the check is NON-VACUOUS: routing_score IS readable by someone',
    PERMISSION_SCOPES.some((s) => isPermitted(s, 'READ', 'routing_score')))
}

// ============================================================================
console.log('§6  C8 — internal-only scores never leave the system (Q9)')
// ============================================================================
{
  const debt = epistemicDebtScore(3)
  const coh = identityCoherenceScore(0.9)
  check('§6.1 the wrapper form is detected',
    findInternalOnlyScores({ a: { b: debt } }).length === 1)
  check('§6.1 the FLATTENED-KEY form is detected too (a serializer cannot smuggle it)',
    findInternalOnlyScores({ payload: { epistemic_debt_score: 3 } }).length === 1)
  check('§6.1 identity_coherence_score is detected', findInternalOnlyScores({ coh }).length === 1)
  check('§6.1 a clean payload reports nothing', findInternalOnlyScores({ a: 1, b: 'x' }).length === 0)
  const cyclic: any = { debt }
  cyclic.self = cyclic
  check('§6.1 the scan is cycle-safe', findInternalOnlyScores(cyclic).length >= 1)
  check('§6.2 egress to an EXTERNAL consumer is REFUSED',
    threw(() => assertNoInternalScoreEgress({ debt }, { kind: 'external_consumer', label: 'public-api' }), InternalScoreEgressError))
  check('§6.2 egress to an INTERNAL scope is permitted (the boundary is the system edge)',
    !threw(() => assertNoInternalScoreEgress({ debt }, { kind: 'internal_scope', scope: 'Threshold' })))
  check('§6.3 both internal-only kinds are registered',
    INTERNAL_ONLY_SCALAR_KINDS.length === 2)
}

// ============================================================================
console.log('§7  HANDOFFS — validation, permission, missing state, stale version')
// ============================================================================
{
  const clock = createDeterministicClock()
  const env = createHandoffEnvelope(
    { from: 'Laboratory', to: 'Threshold', belief_state_id: 'bs-0001', belief_state_version: 7,
      claims: ['claim-0001'], epistemic_debt_score: epistemicDebtScore(2),
      carried_proximity_rank: carriedProximityRank('deliberate') },
    clock,
  )
  check('§7.1 a well-formed envelope at the current version validates',
    validateHandoff(env, { currentBeliefStateVersion: 7 }).ok)
  const stale = validateHandoff(env, { currentBeliefStateVersion: 9 })
  check('§7.2 STALE-VERSION REJECTION', !stale.ok && stale.reason === 'stale_version')
  const future = validateHandoff(env, { currentBeliefStateVersion: 3 })
  check('§7.2 a FUTURE version is also rejected (the receiver cannot hold that state)',
    !future.ok && future.reason === 'stale_version')
  const wrongId = validateHandoff(env, { currentBeliefStateVersion: 7, expectedBeliefStateId: 'bs-other' })
  check('§7.3 a mismatched belief_state_id is rejected', !wrongId.ok && wrongId.reason === 'missing_state')
  const noState = validateHandoff({ ...env, state: undefined }, { currentBeliefStateVersion: 7 })
  check('§7.3 MISSING STATE REJECTION', !noState.ok && noState.reason === 'missing_state')
  const badScope = validateHandoff({ ...env, to: 'Cellar' }, { currentBeliefStateVersion: 7 })
  check('§7.4 an unknown scope is rejected', !badScope.ok && badScope.reason === 'unknown_scope')
  check('§7.5 a non-object is rejected', !validateHandoff(null, { currentBeliefStateVersion: 7 }).ok)
  const badDebt = validateHandoff({ ...env, epistemic_debt: { score: 2, relevant_items: [] } }, { currentBeliefStateVersion: 7 })
  check('§7.6 a RAW-NUMBER debt score is rejected — the wrapper is the contract (C5)',
    !badDebt.ok && badDebt.reason === 'malformed')

  check('§7.7 C5 — the debt score and the proximity rank are SEPARATE fields, unmerged',
    env.epistemic_debt.score.kind === 'epistemic_debt_score' &&
      env.carried_proximity_rank?.kind === 'proximity_rank')
  check('§7.8 C6 — the envelope carries NO identity block (Phase 3, omitted not zeroed)',
    !('identity' in env))

  const ext = toExternalView(env)
  check('§7.9 C8 — the external view has NO epistemic_debt at all (not zeroed, removed)',
    !('epistemic_debt' in (ext as object)))
  check('§7.9 C8 — sendExternally succeeds once stripped',
    !threw(() => sendExternally(env, { kind: 'external_consumer', label: 'partner' })))
  const leaky = { ...env, payload: { sneaky: epistemicDebtScore(1) } }
  check('§7.9 C8 — a score hidden in the PAYLOAD is still refused on egress',
    threw(() => sendExternally(leaky as any, { kind: 'external_consumer', label: 'partner' }), InternalScoreEgressError))
}

// ============================================================================
console.log('§8  THRESHOLD — commitment, review, reopening, and C9')
// ============================================================================
{
  const clock = createDeterministicClock()
  const store = new EventStore(clock)
  const state = createBeliefState(clock)
  check('§8.1 Constraint 7 — a non-Threshold scope CANNOT commit',
    threw(() => commitDecision({ action: 'go', state, supporting_claims: [] },
      { scope: 'Laboratory', caused_by: 't', reason: 'r' }, store, clock), PermissionDeniedError))
  const p = commitDecision({ action: 'go', state, supporting_claims: [] },
    { scope: 'Threshold', caused_by: 't', reason: 'r' }, store, clock)
  check('§8.2 C9 — Threshold produces an AUTHORISED PROPOSAL', p.kind === 'authorised_proposal')
  check('§8.2 C9 — the proposal states plainly that it is not an execution',
    /not an execution/i.test(p.note) && /never executes/i.test(p.note))
  check('§8.3 status derives as COMMITTED', deriveDecisionStatus(p.decision.decision_id, store) === 'COMMITTED')
  const snap = JSON.stringify(p.decision)
  markDecisionForReview(p.decision.decision_id, { scope: 'Threshold', caused_by: 't', reason: 'reopened' }, store)
  check('§8.4 status derives as REVIEW_REQUIRED after a REVIEW event',
    deriveDecisionStatus(p.decision.decision_id, store) === 'REVIEW_REQUIRED')
  check('§8.4 and the DECISION RECORD ITSELF is byte-identical (immutable)',
    JSON.stringify(p.decision) === snap)
  check('§8.5 an unknown decision derives as UNKNOWN, never as COMMITTED',
    deriveDecisionStatus('dec-nope', store) === 'UNKNOWN')
  check('§8.6 a later COMMIT after a REVIEW returns the decision to COMMITTED',
    (() => {
      commitDecision({ action: 'go again', state, supporting_claims: [] },
        { scope: 'Threshold', caused_by: 't', reason: 'reaffirmed' }, store, clock)
      const store2 = new EventStore(createDeterministicClock())
      const q = commitDecision({ action: 'a', state, supporting_claims: [] }, { scope: 'Threshold', caused_by: 't', reason: 'r' }, store2, createDeterministicClock())
      markDecisionForReview(q.decision.decision_id, { scope: 'Threshold', caused_by: 't', reason: 'r' }, store2)
      store2.append({ event_type: 'COMMIT', scope: 'Threshold', caused_by: 't', reason: 'reaffirm', decision_id: q.decision.decision_id })
      return deriveDecisionStatus(q.decision.decision_id, store2) === 'COMMITTED'
    })())

  // C9 / Q1 — there is NO executor anywhere in this library
  check('§8.7 C9 — no library file contains an executor (exec/spawn/fetch/setTimeout)',
    LIB_FILES.every((f) => !/\b(exec|execSync|spawn|fetch|setTimeout|setInterval|require\s*\()\s*\(/.test(sourceWithoutComments(f))))
  check('§8.7 C9 — an EXECUTE event REQUIRES naming an external executor',
    threw(() => store.append({ event_type: 'EXECUTE', scope: 'Threshold', caused_by: 't', reason: 'r' }), ImmutableHistoryError))
  check('§8.7 C9 — an EXECUTE event WITH an external executor is accepted as a RECORD',
    !threw(() => store.append({ event_type: 'EXECUTE', scope: 'Threshold', caused_by: 't', reason: 'r', external_executor: 'outside-party' })))
}

// ============================================================================
console.log('§9  THE BINDING CONSTRAINTS — C1..C9 and spec Constraints 1..10')
// ============================================================================
{
  // C1 — the mandatory placement note must SURVIVE in the shipped source
  const idx = readFileSync(join(LIB_DIR, 'index.ts'), 'utf8')
  const typ = readFileSync(join(LIB_DIR, 'types.ts'), 'utf8')
  check('§9.C1 the mandatory placement note is present in index.ts',
    /CONSTRAINT-DRIVEN BY THE OBSERVATION WINDOW/i.test(idx) && /MAY BE REVISITED/i.test(idx))
  check('§9.C1 and in types.ts, and says the location is NOT architecturally settled',
    /MUST NOT TREAT/i.test(typ) && /ARCHITECTURALLY SETTLED/i.test(typ))

  // C2 — the four names are permission scopes, and are NOT used as actor names
  check('§9.C2 the four scopes are exactly the ruled four',
    PERMISSION_SCOPES.length === 4 &&
      ['Laboratory', 'Attic', 'Archive', 'Threshold'].every((n) => (PERMISSION_SCOPES as readonly string[]).includes(n)))
  check('§9.C2 NO library file assigns an `actor` field (the spec\'s "actor": "Laboratory")',
    LIB_FILES.every((f) => !/\bactor\s*[:=]/.test(sourceWithoutComments(f))))
  check('§9.C2 the event carries `scope`, typed as PermissionScope',
    /scope:\s*PermissionScope/.test(sourceWithoutComments('event-store.ts')))
  check('§9.C2 nothing in the library instantiates an agent/actor from a scope name',
    LIB_FILES.every((f) => !/\b(new\s+(Agent|Actor)|createAgent|createActor|instantiateEnvironment)\b/.test(sourceWithoutComments(f))))

  // C3 — ordinal, never cardinal
  check('§9.C3 no confidence field is typed as a number anywhere',
    !/confidence\s*:\s*number/.test(sourceWithoutComments('claim.ts')))
  check('§9.C3 the ordinal scale has five ranks and no numeric member',
    CONFIDENCE_ORDINAL.length === 5 && CONFIDENCE_ORDINAL.every((c) => typeof c === 'string'))

  // C6 — omitted, not zeroed
  const clock = createDeterministicClock()
  const c = createClaim({ content: 'x', provenance: prov([verified('e')]), dependency_graph_id: 'g', belief_state_id: 'bs', belief_state_version: 1 }, clock)
  check('§9.C6 the Claim has NO identity_relevance key at all', !('identity_relevance' in c))
  check('§9.C6 the Claim has NO interpretive_context key at all', !('interpretive_context' in c))
  check('§9.C6 and neither appears as a 0.0 anywhere in the library',
    LIB_FILES.every((f) => !/identity_relevance\s*[:=]\s*0/.test(sourceWithoutComments(f))))

  // §3 of the session paste — SEMANTIC reuse, NOT structural
  const tmsSrc = sourceWithoutComments('truth-maintenance.ts')
  check('§9.REUSE truth-maintenance.ts imports NOTHING from loop-closure-gate',
    !/from\s+['"][^'"]*loop-closure-gate/.test(tmsSrc))
  check('§9.REUSE no library file imports loop-closure-gate',
    LIB_FILES.every((f) => !/from\s+['"][^'"]*loop-closure/.test(sourceWithoutComments(f))))
  check('§9.REUSE no library file imports from the harness or substrate',
    LIB_FILES.every((f) => !/from\s+['"][^'"]*(substrate|translation-sandwich|sage-reflect|stoic-brain|harness)/.test(sourceWithoutComments(f))))
  check('§9.REUSE the rigour vocabulary is DISTINCT from the harness depth tiers',
    !/\bquick\b|\bdeep\b/.test(tmsSrc.split('REVIEW_RIGOUR')[1]?.slice(0, 200) ?? 'quick'))

  // Constraint 1 — no silent belief mutation: nextVersion REQUIRES an event id
  check('§9.K1 nextVersion requires a revision event id (no silent mutation)',
    /revisionEventId:\s*EventId/.test(sourceWithoutComments('belief-state.ts')))

  // Constraint 8 — no philosophical black boxes: every status is enumerated
  check('§9.K8 every epistemic status is explicitly enumerated', EPISTEMIC_STATUSES.length === 7)
  check('§9.K8 every event type is explicitly enumerated', EVENT_TYPES.length === 11)
  check('§9.K8 supporting vs non-supporting is explicit, and under_challenge does NOT support',
    isSupporting('asserted') && !isSupporting('under_challenge') && !isSupporting('stale') &&
      !isSupporting('retracted') && !isSupporting('superseded'))

  // The library is env-free and IO-free
  check('§9.PURE no library file reads process.env',
    LIB_FILES.every((f) => !/process\.env/.test(sourceWithoutComments(f))))
  check('§9.PURE no library file reads the wall clock or randomness',
    LIB_FILES.every((f) => !/Date\.now\(\)|Math\.random\(\)|new Date\(\)/.test(sourceWithoutComments(f))))
}

// ============================================================================
console.log('§10 TMS — the third reused semantic, from BOTH sides')
// ============================================================================
{
  // The item side (also covered by the critical scenario)
  const a1 = analyseResolution([{ node_id: 'n1', original_rigour: null }], [
    { re_examination_id: 'r', supersedes_ref: 'n1', rigour: 'thorough', seq: 10 },
  ])
  check('§10.1 an item with UNRECORDED rigour is indeterminate even when re-examined thoroughly',
    a1.indeterminate === 1 && a1.verdict === 'unresolved')

  // The RE-EXAMINER side — the gap mutation M9 exposed
  const a2 = analyseResolution([{ node_id: 'n1', original_rigour: 'standard' }], [
    { re_examination_id: 'r', supersedes_ref: 'n1', rigour: null, seq: 10 },
  ])
  check('§10.2 a re-examination whose OWN rigour is unrecorded resolves NOTHING',
    a2.unresolved === 1 && a2.resolved === 0 && a2.verdict === 'unresolved')

  const a3 = analyseResolution([{ node_id: 'n1', original_rigour: 'standard' }], [
    { re_examination_id: 'r', supersedes_ref: 'n1', rigour: 'standard', seq: 10 },
  ])
  check('§10.2 and the path IS reachable — a recorded, adequate re-examination resolves',
    a3.resolved === 1 && a3.verdict === 'clean')

  // Ordering — a re-examination must come AFTER the thing it resolves
  const a4 = analyseResolution([{ node_id: 'n1', original_rigour: 'standard' }],
    [{ re_examination_id: 'r', supersedes_ref: 'n1', rigour: 'standard', seq: 5 }], { n1: 10 })
  check('§10.3 a re-examination EARLIER than the item resolves nothing',
    a4.unresolved === 1)

  // Explicit ref link — naming a different item resolves nothing
  const a5 = analyseResolution([{ node_id: 'n1', original_rigour: 'standard' }],
    [{ re_examination_id: 'r', supersedes_ref: 'n2', rigour: 'thorough', seq: 10 }])
  check('§10.4 a thorough re-examination that names a DIFFERENT item resolves nothing',
    a5.unresolved === 1)
  const a6 = analyseResolution([{ node_id: 'n1', original_rigour: 'standard' }],
    [{ re_examination_id: 'r', supersedes_ref: null, rigour: 'thorough', seq: 10 }])
  check('§10.4 a re-examination naming NOTHING resolves nothing',
    a6.unresolved === 1)

  const g = new DependencyGraph()
  g.addNode({ node_id: 'solo', kind: 'claim' })
  check('§10.5 an invalidation with no dependents reads no_dependents, not clean',
    analyseStaleness('solo', g, () => 'standard', []).verdict === 'no_dependents')
}

// ============================================================================
console.log('§11 COMPILE-TIME PINS (only real under tsc; tsx does not typecheck)')
// ============================================================================
{
  const baseInput: CreateClaimInput = {
    content: 'x', provenance: prov([verified('e')]),
    dependency_graph_id: 'g', belief_state_id: 'bs', belief_state_version: 1,
  }
  // C4 — supplying a confidence must be a COMPILE ERROR
  // @ts-expect-error C4: agent-supplied confidence is structurally forbidden
  const _c4: CreateClaimInput = { ...baseInput, confidence: 'strong' }
  // @ts-expect-error C4: an agent_confidence field is structurally forbidden
  const _c4b: CreateClaimInput = { ...baseInput, agent_confidence: 'strong' }
  // C6 — identity_relevance / interpretive_context must be COMPILE ERRORS
  // @ts-expect-error C6: identity_relevance is omitted until Phase 3
  const _c6: CreateClaimInput = { ...baseInput, identity_relevance: 0.0 }
  // @ts-expect-error C6: interpretive_context is omitted until Phase 3
  const _c6b: CreateClaimInput = { ...baseInput, interpretive_context: {} }
  // C4 (PR19 HIGH) — an EvidenceRef must NOT be forgeable from a bare object
  // literal. Before the fold this compiled, and a caller could self-certify
  // evidence as 'verified'. Now only attestEvidence can produce one.
  // @ts-expect-error C4: EvidenceRef is branded — a literal cannot forge one
  const _ev1: EvidenceRef = { evidence_id: 'x', verification: 'verified' }
  // @ts-expect-error C4: nor with a hand-written attested_by
  const _ev2: EvidenceRef = { evidence_id: 'x', verification: 'verified', attested_by: { verifier_id: 'me', kind: 'system_verifier' } }
  void _ev1; void _ev2
  // C5 — a Cognitive OS scalar must not be combinable with a proximity rank
  // @ts-expect-error C5: no Cognitive OS scalar may be combined with a proximity rank
  const _c5 = epistemicDebtScore(1) + carriedProximityRank('deliberate')
  // @ts-expect-error C5: nor may an identity coherence score
  const _c5b = identityCoherenceScore(1) + carriedProximityRank('deliberate')
  void _c4; void _c4b; void _c6; void _c6b; void _c5; void _c5b
  check('§11 compile-time pins are present in this file (enforced by the tsc run)', true)
}

// ============================================================================
console.log('§12 PR19 REGRESSION PINS — one per upheld independent-review finding')
// ============================================================================
{
  // PR19 HIGH x2 — C4: evidence is branded; the forge-by-literal route is closed,
  // and the honest limit (Phase 1 verifies nothing) is legible in the record.
  const ev = attestEvidence('e1', 'verified', AUTH)
  check('§12.C4 attestEvidence is the ONE chokepoint and records who attested',
    ev.attested_by.verifier_id === 'battery-harness' && ev.attested_by.kind === 'unverified_phase1')
  check('§12.C4 HONEST LIMIT is legible: a Phase-1 attestation is NOT genuine verification',
    allEvidenceGenuinelyVerified([ev]) === false)
  check('§12.C4 and the predicate is non-vacuous — a real verifier WOULD read true',
    allEvidenceGenuinelyVerified([
      attestEvidence('e2', 'verified', { verifier_id: 'real', kind: 'system_verifier' }),
    ]) === true)
  check('§12.C4 an empty evidence set is NOT "genuinely verified" (silence is not proof)',
    allEvidenceGenuinelyVerified([]) === false)

  // PR19 HIGH x2 + MEDIUM x2 — C8: the egress scan is FAIL-CLOSED on anything it
  // cannot exhaustively read. All four live-reproduced bypasses are now refused.
  const dbt = epistemicDebtScore(0.9)
  const ext = { kind: 'external_consumer' as const, label: 'public-api' }
  check('§12.C8 a score inside a MAP is refused (was a live leak)',
    threw(() => assertNoInternalScoreEgress({ p: new Map([['epistemic_debt_score', dbt]]) }, ext), InternalScoreEgressError))
  check('§12.C8 a score inside a SET is refused',
    threw(() => assertNoInternalScoreEgress({ p: new Set([dbt]) }, ext), InternalScoreEgressError))
  const nonEnum: Record<string, unknown> = {}
  Object.defineProperty(nonEnum, 'epistemic_debt_score', { value: 0.9, enumerable: false })
  check('§12.C8 a NON-ENUMERABLE own property is now FOUND (Reflect.ownKeys)',
    scanForEgress(nonEnum).found.length === 1 &&
      threw(() => assertNoInternalScoreEgress(nonEnum, ext), InternalScoreEgressError))
  class SneakyDebt { get epistemic_debt_score() { return epistemicDebtScore(0.9) } }
  check('§12.C8 a PROTOTYPE GETTER on a class instance is refused as unscannable',
    threw(() => assertNoInternalScoreEgress({ w: new SneakyDebt() }, ext), InternalScoreEgressError))
  const symPayload: Record<string | symbol, unknown> = {}
  symPayload[Symbol('epistemic_debt_score')] = dbt
  check('§12.C8 a SYMBOL-KEYED score is refused',
    threw(() => assertNoInternalScoreEgress(symPayload, ext), InternalScoreEgressError))
  const accessor = { get x() { return 1 } }
  check('§12.C8 ANY accessor is refused — the scan never invokes a getter to certify',
    scanForEgress(accessor).unscannable.length === 1)
  check('§12.C8 and the fail-closed rule is NON-VACUOUS: a plain clean payload passes',
    !threw(() => assertNoInternalScoreEgress({ a: 1, b: [2, 'x'], c: { d: null } }, ext)))

  // PR19 HIGH — markDecisionForReview was gated on READ, which Archive holds.
  const clock2 = createDeterministicClock()
  const store2 = new EventStore(clock2)
  const st2 = createBeliefState(clock2)
  const pr = commitDecision({ action: 'a', state: st2, supporting_claims: [] },
    { scope: 'Threshold', caused_by: 't', reason: 'r' }, store2, clock2)
  check('§12.HIGH Archive — a documented READ-ONLY reconstructor — CANNOT mark a decision for review',
    threw(() => markDecisionForReview(pr.decision.decision_id,
      { scope: 'Archive', caused_by: 'x', reason: 'r' }, store2), PermissionDeniedError))
  check('§12.HIGH Laboratory cannot either',
    threw(() => markDecisionForReview(pr.decision.decision_id,
      { scope: 'Laboratory', caused_by: 'x', reason: 'r' }, store2), PermissionDeniedError))
  check('§12.HIGH but Threshold still can — the fix did not break the real path',
    !threw(() => markDecisionForReview(pr.decision.decision_id,
      { scope: 'Threshold', caused_by: 't', reason: 'r' }, store2)))
  check('§12.HIGH Archive holds NO write verb on decision',
    !isPermitted('Archive', 'UPDATE', 'decision') && !isPermitted('Archive', 'COMMIT', 'decision'))

  // PR19 MEDIUM — a repeat retraction inflated the debt summary.
  const clock3 = createDeterministicClock()
  const store3 = new EventStore(clock3)
  let st3 = createBeliefState(clock3)
  const c3 = createClaim({ content: 'x', provenance: prov([verified('e')]),
    dependency_graph_id: 'g', belief_state_id: st3.belief_state_id, belief_state_version: st3.version }, clock3)
  const e3 = store3.append({ event_type: 'OBSERVE', scope: 'Laboratory', caused_by: 't', reason: 'r', claim_id: c3.claim_id })
  st3 = withClaim(st3, c3, e3.event_id, clock3)
  const r3 = retractClaim(st3, c3.claim_id, { scope: 'Laboratory', caused_by: 't', reason: 'r' }, store3, clock3)
  check('§12.MED a REPEAT retraction is refused (it would inflate epistemic debt)',
    threw(() => retractClaim(r3.state, c3.claim_id, { scope: 'Laboratory', caused_by: 't', reason: 'r' }, store3, clock3)))
  check('§12.MED the first retraction recorded the claim exactly ONCE',
    r3.state.epistemic_debt.unresolved_claims.filter((x) => x === c3.claim_id).length === 1)

  // PR19 MEDIUM — the C9 "no executor" grep was defeated by import aliasing.
  // Replaced by a far stronger invariant: EVERY import in the library must be a
  // RELATIVE import to a sibling cognitive-os module. Aliasing cannot evade it.
  const importRe = /(?:^|\n)\s*import\s[^;]*?from\s+['"]([^'"]+)['"]/g
  const badImports: string[] = []
  for (const f of LIB_FILES) {
    const src = sourceWithoutComments(f)
    let m: RegExpExecArray | null
    while ((m = importRe.exec(src)) !== null) {
      if (!m[1].startsWith('./')) badImports.push(`${f} -> ${m[1]}`)
    }
  }
  check('§12.C9 EVERY library import is a relative sibling — no node builtin, no package, ' +
    'no aliasing escape (strictly stronger than the defeated identifier grep)',
    badImports.length === 0)
  check('§12.C9 and that scan is NON-VACUOUS — it actually found imports to check',
    LIB_FILES.some((f) => /(?:^|\n)\s*import\s/.test(sourceWithoutComments(f))))

  // PR19 LOW — §10 never pinned the STRENGTH of the same-depth rule in this file.
  const weak = analyseResolution([{ node_id: 'n1', original_rigour: 'thorough' }], [
    { re_examination_id: 'r', supersedes_ref: 'n1', rigour: 'cursory', seq: 10 },
  ])
  check('§12.LOW SAME-DEPTH STRENGTH: a CURSORY re-exam does NOT resolve a THOROUGH item',
    weak.unresolved === 1 && weak.verdict === 'unresolved')
  const standardOnThorough = analyseResolution([{ node_id: 'n1', original_rigour: 'thorough' }], [
    { re_examination_id: 'r', supersedes_ref: 'n1', rigour: 'standard', seq: 10 },
  ])
  check('§12.LOW nor does a STANDARD re-exam of a THOROUGH item',
    standardOnThorough.unresolved === 1)
  const thoroughOnThorough = analyseResolution([{ node_id: 'n1', original_rigour: 'thorough' }], [
    { re_examination_id: 'r', supersedes_ref: 'n1', rigour: 'thorough', seq: 10 },
  ])
  check('§12.LOW and EQUAL rigour DOES resolve — the rule is >=, not >',
    thoroughOnThorough.resolved === 1)

  // PR19 NIT — dead withReplacedClaim removed.
  check('§12.NIT the dead withReplacedClaim (optional clock that threw) is GONE',
    !/export function withReplacedClaim/.test(sourceWithoutComments('belief-state.ts')))
}

// ============================================================================
// NON-VACUITY FLOOR
// ============================================================================
const MIN_ASSERTIONS = 120
check(
  `NON-VACUITY FLOOR — at least ${MIN_ASSERTIONS} assertions must have run`,
  passed + failed >= MIN_ASSERTIONS,
)

for (const [k, v] of Object.entries(SAVED_ENV)) {
  if (v === undefined) delete process.env[k]
  else process.env[k] = v
}
if (failures.length > 0) {
  console.error('\nFAILURES:')
  for (const f of failures) console.error(`  - ${f}`)
}
console.log(`\ncognitive-os battery: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
