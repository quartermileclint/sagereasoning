/**
 * stoa-trust-events.test.ts — the Stoa Q5c/Q13a trust-event wiring battery
 * (ST7 thread 2, 2026-08-04). Run: npx tsx <this file>
 *
 * Binding source: operations/connective-layer-2026-08/2026-08-04-mentor-
 * consultation-stoa-followups-verbatim.md — verbatim wins.
 *
 * Pins the non-negotiables the scoped plan named:
 *   A. Domain-by-content, never severity — both contradiction events can fire
 *      together from one shared claim; neither event type's derivation
 *      depends on the other being present.
 *   B. The null-domain trap — the divergence event is HARD-CODED to
 *      virtue_domain 'oversight' (never a caller-supplied choice, never
 *      null), and folding it produces has_evidence:false + preserves the A7
 *      AND-guard (oversight stays increase-unreachable).
 *   C. Flag-triggered only — the deriver layer has NO ambient trigger (pure,
 *      no I/O); the emission layer requires BOTH SUBSTRATE_TRUST_CORE_ENABLED
 *      AND SUBSTRATE_STOA_TRUST_EVENTS_ENABLED, byte-identical (zero DB
 *      touch) when either is unset.
 *   D. The evidentiary bar — an empty claim/artifact/justification/entry id
 *      never derives an event (never a fabricated row from an incomplete
 *      submission). No structural dedup between the two Q5c events is
 *      covered in §A (A.1/A.3) — both may legitimately coexist, and (PR19
 *      fold, 2026-08-04) each now carries its OWN correlation id, so an
 *      identical resubmission of ONE block dedupes independently of
 *      whatever else is submitted alongside it.
 *   F. The admin route's own source-grep pins (INV, the house pattern) —
 *      admin gate, agent-only scope, evidentiary-bar enforcement, boundary
 *      re-derivation, the migration file's vocabulary (incl. F.11's
 *      superset check — additive is not just "no DROP TABLE").
 *   G. The independent-evidence gate (mentor ruling, 2026-08-04, responding
 *      to the PR19 MEDIUM-1 finding): a contradiction/divergence event on a
 *      domain with NO prior independent trust state is ledgered but HELD —
 *      never folded into the public agent_trust_state, never seeds a row.
 *      Exercised against the real store logic via the in-memory fake
 *      (fake-supabase.ts).
 *
 * SCOPE HONESTY: this battery does not touch the DB (no Supabase env
 * required) — the derivers and effect map are pure; the store fold
 * (foldDomainEvent/applyReflectAcrossDomains dispatch) is exercised via the
 * pure trust-transition.ts replay (foldTrustEvents), which is the exact logic
 * trust-core-store.ts's dispatch relies on (event.virtueDomain === null ⇒
 * applyReflectAcrossDomains); it does not re-open a live DB connection to
 * prove the store's own branch, which is unchanged by this build and already
 * battery-covered elsewhere (trust-core-store.test.ts).
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  deriveStoaContradictionEvents,
  deriveStoaCallingDivergenceEvent,
} from '../derive-trust-events'
import { EVENT_EFFECT, applyTrustEvent, foldTrustEvents } from '../trust-transition'
import { initialEarnedDomainState } from '../types'
import { computeEffectiveDomain } from '../trust-aggregate'
import { STOA_TRUST_EVENTS_ENV_VAR, TRUST_CORE_ENV_VAR } from '../trust-core-flag'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    pass++
    console.log(`  PASS ${name}`)
  } else {
    fail++
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const NOW = new Date('2026-08-04T12:00:00Z')

// ============================================================================
// A. Domain-by-content, never severity — both fire independently
// ============================================================================
{
  console.log('§A domain-by-content, both may fire')
  const base = {
    agentId: 'sagereasoning:demo@v1',
    ownerUserId: null,
    credentialRef: 'api_key:test',
    stoaEntryId: 'entry-1',
    claimQuote: 'I never fail to escalate a security concern.',
    now: NOW,
  }
  const both = deriveStoaContradictionEvents({
    ...base,
    contradictsOversight: { artifactRef: 'signed:key1', justification: 'the claim was simply false', correlationId: 'test-corr' },
    contradictsDikaiosyne: { artifactRef: 'signed:key2', justification: 'affected another party', correlationId: 'test-corr' },
  })
  check('A.1 both events fire from one root cause', both.length === 2)
  check(
    'A.2 one is oversight/decrease, the other dikaiosyne/decrease — no severity ranking between them',
    both.some((e) => e.virtueDomain === 'oversight' && e.eventType === 'stoa-claim-contradicted-oversight') &&
      both.some((e) => e.virtueDomain === 'dikaiosyne' && e.eventType === 'stoa-claim-contradicted-dikaiosyne'),
  )
  check(
    'A.3 no dedup collapses them — distinct artifactRef preserved per event',
    both.find((e) => e.virtueDomain === 'oversight')?.artifactRef === 'signed:key1' &&
      both.find((e) => e.virtueDomain === 'dikaiosyne')?.artifactRef === 'signed:key2',
  )

  const onlyOversight = deriveStoaContradictionEvents({
    ...base,
    contradictsOversight: { artifactRef: 'signed:key1', justification: 'simply false', correlationId: 'test-corr' },
  })
  check('A.4 only-oversight submission emits exactly one event, not two', onlyOversight.length === 1)
  check('A.5 the one event carries the correct type', onlyOversight[0]?.eventType === 'stoa-claim-contradicted-oversight')

  const onlyDik = deriveStoaContradictionEvents({
    ...base,
    contradictsDikaiosyne: { artifactRef: 'signed:key2', justification: 'affected another party', correlationId: 'test-corr' },
  })
  check('A.6 only-dikaiosyne submission emits exactly one event', onlyDik.length === 1)
  check('A.7 domain is an INPUT (asserted), not derived from the claim text', onlyDik[0]?.virtueDomain === 'dikaiosyne')

  const neither = deriveStoaContradictionEvents(base)
  check('A.8 neither block present ⇒ no events', neither.length === 0)

  check('A.9 both events use the artifactKind stoa_examined_artifact', both.every((e) => e.artifactKind === 'stoa_examined_artifact'))
  check('A.10 EVENT_EFFECT: both contradiction types are ordinary decrease', EVENT_EFFECT['stoa-claim-contradicted-oversight'] === 'decrease' && EVENT_EFFECT['stoa-claim-contradicted-dikaiosyne'] === 'decrease')
}

// ============================================================================
// B. The null-domain trap — divergence is hard-coded to 'oversight'
// ============================================================================
{
  console.log('§B null-domain trap (Q13a)')
  const event = deriveStoaCallingDivergenceEvent({
    agentId: 'sagereasoning:demo@v1',
    ownerUserId: null,
    credentialRef: 'api_key:test',
    stoaEntryId: 'entry-1',
    callingRecordRef: 'collab:orch|task-1',
    divergenceDescription: 'declares data-science; calling record shows only infra work.',
    now: NOW,
    correlationId: 'corr-b',
  })
  check('B.1 divergence event derives', event !== null)
  check("B.2 virtue_domain is 'oversight', NEVER null", event?.virtueDomain === 'oversight')
  check("B.3 artifactKind reuses 'calling_record' (shares the calling record as a data source)", event?.artifactKind === 'calling_record')
  check("B.4 EVENT_EFFECT: divergence is 'flag' (never a caution/severity ladder)", EVENT_EFFECT['stoa-declaration-diverges-from-calling'] === 'flag')

  // Fold it and confirm the flag effect is a genuine no-op on the domain state.
  const seeded = initialEarnedDomainState({ profilePrior: 'habitual', volatility: 'high' })
  const folded = event ? applyTrustEvent(seeded, event) : seeded
  check('B.5 folding the flag event changes NO field of the earned state', JSON.stringify(folded) === JSON.stringify(seeded))

  // The store's real dispatch: foldTrustEvents routes a NON-null-domain event
  // through the domain-fold path (never applyReflectAcrossDomains) — proven
  // here by replaying it through the pure engine and confirming it seeds
  // EXACTLY the one 'oversight' domain, never every domain (the reflect
  // agent-wide fan-out this build must NOT trigger).
  const states = event ? foldTrustEvents([event], () => initialEarnedDomainState()) : new Map()
  check('B.6 foldTrustEvents seeds exactly one domain row (oversight), not an agent-wide fan-out', states.size === 1 && states.has('oversight'))

  // has_evidence:false — a flag event trips none of the three hasEvidence
  // conditions (activity/rank-change/justice-cap), so the public trust
  // record + the S10 ENV-1 404 gate stay honest, and the A7 AND-guard
  // (oversight.hasEvidence) survives.
  const oversightState = states.get('oversight')!
  const effective = computeEffectiveDomain('oversight', oversightState, NOW)
  check('B.7 the seeded oversight row reads has_evidence:false', effective.hasEvidence === false)
  check('B.8 the A7 AND-guard premise survives: a flag event cannot raise oversight into the higher tier', effective.hasEvidence === false)
}

// ============================================================================
// C. Flag-triggered only — pure derivers, no ambient trigger
// ============================================================================
{
  console.log('§C flag-triggered only (no background comparator)')
  // The derivers take no clock/env/random/network input beyond their
  // explicit `now` param — structurally incapable of running on a schedule
  // or in response to "fresh assessments" without an explicit call.
  const deriveSrc = readFileSync(join(__dirname, '..', 'derive-trust-events.ts'), 'utf8')
  const stoaBlock = deriveSrc.slice(deriveSrc.indexOf('Stoa Q5c/Q13a (2026-08-04)'))
  check(
    'C.1 the Stoa deriver block performs no I/O (no fetch/env/setInterval/setTimeout/cron)',
    !/fetch\s*\(|process\.env|setInterval|setTimeout|cron/i.test(stoaBlock),
  )
  check('C.2 non-vacuity: the Stoa deriver block was found and is non-trivial', stoaBlock.length > 500, `found ${stoaBlock.length} chars`)

  // The emission layer's own flag names — both required, sourced from a
  // DEDICATED var (not reusing SUBSTRATE_TRUST_CORE_ENABLED alone).
  check(
    'C.3 a dedicated Stoa flag env var exists, distinct from the trust-core flag',
    STOA_TRUST_EVENTS_ENV_VAR === 'SUBSTRATE_STOA_TRUST_EVENTS_ENABLED' &&
      (STOA_TRUST_EVENTS_ENV_VAR as string) !== (TRUST_CORE_ENV_VAR as string),
  )

  const hooksSrc = readFileSync(join(__dirname, '..', 'emission-hooks.ts'), 'utf8')
  const contraFn = hooksSrc.slice(
    hooksSrc.indexOf('export async function emitStoaContradictionTrustEvents'),
    hooksSrc.indexOf('export interface StoaCallingDivergenceEmissionInput'),
  )
  const divFn = hooksSrc.slice(hooksSrc.indexOf('export async function emitStoaCallingDivergenceTrustEvent'))
  check(
    'C.4 emitStoaContradictionTrustEvents checks BOTH flags before any derivation',
    /isTrustCoreEnabled\(\)\s*\|\|\s*!isStoaTrustEventsEnabled\(\)/.test(contraFn),
  )
  check(
    'C.5 emitStoaCallingDivergenceTrustEvent checks BOTH flags before any derivation',
    /isTrustCoreEnabled\(\)\s*\|\|\s*!isStoaTrustEventsEnabled\(\)/.test(divFn),
  )
}

// ============================================================================
// C2. Live flag-gating behaviour (hermetic — no Supabase env; a flag-off
//     invocation must reach `written:0` WITHOUT throwing, i.e. before any
//     DB-layer call, exactly mirroring the emission-hooks.test.ts LEG A proof).
// ============================================================================
async function runFlagGatingLegs() {
  console.log('§C2 flag-gating (hermetic, LEG A pattern)')
  const SAVED = {
    TRUST_CORE: process.env.SUBSTRATE_TRUST_CORE_ENABLED,
    STOA: process.env.SUBSTRATE_STOA_TRUST_EVENTS_ENABLED,
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY

  const { emitStoaContradictionTrustEvents, emitStoaCallingDivergenceTrustEvent } = await import(
    '../emission-hooks'
  )

  async function withEnv(trustCore: string | undefined, stoa: string | undefined, fn: () => Promise<unknown>) {
    if (trustCore === undefined) delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
    else process.env.SUBSTRATE_TRUST_CORE_ENABLED = trustCore
    if (stoa === undefined) delete process.env.SUBSTRATE_STOA_TRUST_EVENTS_ENABLED
    else process.env.SUBSTRATE_STOA_TRUST_EVENTS_ENABLED = stoa
    return fn()
  }

  const contraInput = {
    agentId: 'sagereasoning:demo@v1',
    ownerUserId: null,
    credentialRef: 'api_key:test',
    stoaEntryId: 'entry-1',
    claimQuote: 'claim text',
    contradictsOversight: { artifactRef: 'signed:key1', justification: 'simply false', correlationId: 'test-corr' },
  }
  const divInput = {
    agentId: 'sagereasoning:demo@v1',
    ownerUserId: null,
    credentialRef: 'api_key:test',
    stoaEntryId: 'entry-1',
    callingRecordRef: 'collab:orch|task-1',
    divergenceDescription: 'diverges',
    correlationId: 'corr-c2b',
  }

  // Both unset ⇒ written:0, no throw (would throw immediately inside
  // getAdminClient if it reached the DB layer, since env is deleted above).
  const r1 = await withEnv(undefined, undefined, () => emitStoaContradictionTrustEvents(contraInput))
  check('C2.1 both flags unset ⇒ written:0, no DB touch', JSON.stringify(r1) === JSON.stringify({ written: 0, held: 0 }))

  // Trust-core on, Stoa flag off ⇒ still written:0 (E2: BOTH required).
  const r2 = await withEnv('true', undefined, () => emitStoaContradictionTrustEvents(contraInput))
  check('C2.2 trust-core ON + Stoa flag OFF ⇒ written:0 (E2 — both required, not either)', JSON.stringify(r2) === JSON.stringify({ written: 0, held: 0 }))

  // Stoa flag on, trust-core off ⇒ still written:0.
  const r3 = await withEnv(undefined, 'true', () => emitStoaContradictionTrustEvents(contraInput))
  check('C2.3 Stoa flag ON + trust-core OFF ⇒ written:0', JSON.stringify(r3) === JSON.stringify({ written: 0, held: 0 }))

  const r4 = await withEnv(undefined, undefined, () => emitStoaCallingDivergenceTrustEvent(divInput))
  check('C2.4 divergence emitter: both flags unset ⇒ written:0, no DB touch', JSON.stringify(r4) === JSON.stringify({ written: 0, held: 0 }))

  // Both ON with no Supabase env reaches the DB layer and fails-honest (never
  // throws to the caller) — the same LEG B proof emission-hooks.test.ts
  // already established for the sibling emitters; confirm the Stoa emitters
  // share that discipline rather than assuming it.
  const originalError = console.error
  const logged: string[] = []
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(' '))
  }
  let threw = false
  let r5: unknown
  try {
    r5 = await withEnv('true', 'true', () => emitStoaContradictionTrustEvents(contraInput))
  } catch {
    threw = true
  } finally {
    console.error = originalError
  }
  check('C2.5 both flags ON + no Supabase env ⇒ never throws to the caller (fail-honest)', threw === false)
  check(
    'C2.6 the failure is LOGGED with the house [trust-core] prefix, not silent',
    logged.some((l) => l.includes('[trust-core]')),
    logged.join(' | '),
  )
  check('C2.7 the failure result carries an error field, not a fabricated written count', r5 !== undefined && typeof (r5 as { error?: string }).error === 'string')

  // Restore.
  if (SAVED.TRUST_CORE === undefined) delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
  else process.env.SUBSTRATE_TRUST_CORE_ENABLED = SAVED.TRUST_CORE
  if (SAVED.STOA === undefined) delete process.env.SUBSTRATE_STOA_TRUST_EVENTS_ENABLED
  else process.env.SUBSTRATE_STOA_TRUST_EVENTS_ENABLED = SAVED.STOA
  if (SAVED.URL !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = SAVED.URL
  if (SAVED.KEY !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = SAVED.KEY
}

// ============================================================================
// D. The evidentiary bar — empty inputs never derive an event
// ============================================================================
{
  console.log('§D evidentiary bar (empty inputs)')
  const base = {
    agentId: 'sagereasoning:demo@v1',
    ownerUserId: null,
    credentialRef: null,
    stoaEntryId: 'entry-1',
    claimQuote: 'a real claim',
    now: NOW,
  }
  check(
    'D.1 empty claimQuote ⇒ no events even with valid blocks',
    deriveStoaContradictionEvents({
      ...base,
      claimQuote: '   ',
      contradictsOversight: { artifactRef: 'a', justification: 'b', correlationId: 'test-corr' },
    }).length === 0,
  )
  check(
    'D.2 empty stoaEntryId ⇒ no events',
    deriveStoaContradictionEvents({
      ...base,
      stoaEntryId: '',
      contradictsOversight: { artifactRef: 'a', justification: 'b', correlationId: 'test-corr' },
    }).length === 0,
  )
  check(
    'D.3 empty artifactRef ⇒ that block does not fire',
    deriveStoaContradictionEvents({
      ...base,
      contradictsOversight: { artifactRef: '  ', justification: 'b', correlationId: 'test-corr' },
    }).length === 0,
  )
  check(
    'D.4 empty justification ⇒ that block does not fire (curator supplies the pairing, not just a pointer)',
    deriveStoaContradictionEvents({
      ...base,
      contradictsOversight: { artifactRef: 'a', justification: '', correlationId: 'test-corr' },
    }).length === 0,
  )
  check(
    'D.5 divergence: empty callingRecordRef ⇒ null',
    deriveStoaCallingDivergenceEvent({
      agentId: 'a', ownerUserId: null, credentialRef: null,
      stoaEntryId: 'e', callingRecordRef: '', divergenceDescription: 'd',
      now: NOW, correlationId: 'c',
    }) === null,
  )
  check(
    'D.6 divergence: empty divergenceDescription ⇒ null',
    deriveStoaCallingDivergenceEvent({
      agentId: 'a', ownerUserId: null, credentialRef: null,
      stoaEntryId: 'e', callingRecordRef: 'ref', divergenceDescription: '   ',
      now: NOW, correlationId: 'c',
    }) === null,
  )
  check(
    'D.7 divergence: empty stoaEntryId ⇒ null',
    deriveStoaCallingDivergenceEvent({
      agentId: 'a', ownerUserId: null, credentialRef: null,
      stoaEntryId: '', callingRecordRef: 'ref', divergenceDescription: 'd',
      now: NOW, correlationId: 'c',
    }) === null,
  )
}

// ============================================================================
// F. The admin route + migration source-grep pins (INV, the house pattern)
// ============================================================================
{
  console.log('§F admin route + migration pins')
  const routeSrc = readFileSync(
    join(__dirname, '..', '..', '..', '..', 'app', 'api', 'admin', 'stoa-trust-flag', 'route.ts'),
    'utf8',
  )
  check('F.1 the route is admin-gated via the house requireAdmin pattern', /requireAdmin\(request\)/.test(routeSrc))
  check('F.2 the route rate-limits via the admin bucket', /RATE_LIMITS\.admin/.test(routeSrc))
  check('F.3 the route reads the Stoa entry via the store (not a raw table query)', /getStoaEntryById\(/.test(routeSrc))
  // F.4 (PR19 fold, 2026-08-04, MEDIUM — the substring-presence version of
  // this pin was vacuous: mutation-proven to stay green with the guard
  // literally replaced by `if (false)`, since both substrings survive
  // elsewhere in the file). Extract the EXACT guard block and require the
  // 400 status to appear WITHIN it (a bounded window), and self-test the
  // extractor against a guard-removed mutant to prove it can actually go
  // red (memory: guard-needs-a-non-vacuity-floor).
  function extractAgentIdGuardBlock(src: string): string | null {
    const start = src.indexOf('if (!entry.agentId) {')
    if (start === -1) return null
    const end = src.indexOf('\n  }', start)
    return end === -1 ? null : src.slice(start, end)
  }
  const guardBlock = extractAgentIdGuardBlock(routeSrc)
  check('F.4a the exact agentId guard block was found (non-vacuity)', guardBlock !== null, `found: ${guardBlock !== null}`)
  check(
    'F.4b the guard block itself refuses with 400 (not merely present somewhere in the file)',
    guardBlock !== null && /status:\s*400/.test(guardBlock) && /NextResponse\.json/.test(guardBlock),
  )
  const mutantSrc = routeSrc.replace('if (!entry.agentId) {', 'if (false) {')
  check(
    'F.4c mutation self-test: removing the guard condition IS caught (the extractor can go red)',
    extractAgentIdGuardBlock(mutantSrc) === null,
  )
  check(
    'F.5 the route checks both flags before reporting flag_enabled honestly',
    /isTrustCoreEnabled\(\)\s*&&\s*isStoaTrustEventsEnabled\(\)/.test(routeSrc),
  )
  check('F.6 the route calls both emitters', /emitStoaContradictionTrustEvents/.test(routeSrc) && /emitStoaCallingDivergenceTrustEvent/.test(routeSrc))
  check('F.7 non-vacuity: the route file was found and is substantial', routeSrc.length > 2000, `found ${routeSrc.length} chars`)

  const migSrc = readFileSync(
    join(__dirname, '..', '..', '..', '..', '..', 'supabase-agent-trust-events-stoa-vocabulary-migration.sql'),
    'utf8',
  )
  check('F.8 migration widens event_type to include all three Stoa literals', ['stoa-claim-contradicted-oversight', 'stoa-claim-contradicted-dikaiosyne', 'stoa-declaration-diverges-from-calling'].every((t) => migSrc.includes(`'${t}'`)))
  check('F.9 migration widens artifact_kind to include stoa_examined_artifact', migSrc.includes("'stoa_examined_artifact'"))
  check('F.10 migration is additive (no DROP TABLE / no DELETE on live rows)', !/DROP TABLE|DELETE FROM public\.agent_trust_events\s+WHERE\s+(?!agent_id = 'sagereasoning:stoa-probe)/i.test(migSrc))

  // F.11 (PR19 fold, 2026-08-04, LOW — F.10 only proved the absence of a
  // destructive statement, never that the new CHECK is a SUPERSET of the
  // prior S9b vocabulary; a migration that dropped an old literal while
  // adding the three new ones would still pass F.8–F.10). Parse the actual
  // event_type CHECK's IN-list out of the §A ADD CONSTRAINT block and assert
  // it retains every one of the 15 pre-existing literals verbatim.
  const addConstraintBlock = migSrc.slice(
    migSrc.indexOf('ADD CONSTRAINT agent_trust_events_event_type_check'),
    migSrc.indexOf(');', migSrc.indexOf('ADD CONSTRAINT agent_trust_events_event_type_check')),
  )
  const PRIOR_S9B_EVENT_TYPES = [
    'credential-completed', 'reflect-completed-honest',
    'justice-surface-transparently-handled', 'justice-surface-unevaluated',
    'justice-surface-violated', 'justice-surface-indeterminate',
    'credential-suspended-revoked', 'passion-unflagged-by-self-screen',
    'orchestrator-proceeds-under-habitual-flag',
    'delegation-reflection-case-1', 'delegation-reflection-case-2',
    'delegation-reflection-case-3',
    'calling-completed', 'reflect-screened-honest', 'self-screen-absent',
  ]
  check(
    'F.11a the ADD CONSTRAINT block for event_type was found (non-vacuity)',
    addConstraintBlock.length > 100,
    `found ${addConstraintBlock.length} chars`,
  )
  check(
    'F.11b the new CHECK is a SUPERSET of all 15 prior S9b literals — none dropped',
    PRIOR_S9B_EVENT_TYPES.every((t) => addConstraintBlock.includes(`'${t}'`)),
    PRIOR_S9B_EVENT_TYPES.filter((t) => !addConstraintBlock.includes(`'${t}'`)).join(', '),
  )
}

// ============================================================================
// G. THE INDEPENDENT-EVIDENCE GATE (mentor ruling, 2026-08-04 —
//    operations/connective-layer-2026-08/2026-08-04-mentor-consultation-
//    stoa-followups-verbatim.md, responding to the PR19 MEDIUM-1 finding):
//    "a contradiction event narrows or corrects an existing record; it does
//    not by itself create one." Q5c/Q13a route through emitStoaGatedTrustEvents
//    (NOT the generic emitTrustEvents every other event type uses) —
//    ledgered ALWAYS, folded into the public agent_trust_state ONLY when the
//    domain already carried independent evidence BEFORE this event. Exercised
//    against the real store logic via the house in-memory fake (fake-supabase.ts
//    — the same fake the rest of the trust-core battery uses; no live DB).
// ============================================================================
async function runEvidenceGateSection() {
  console.log('§G the independent-evidence gate (mentor ruling 2026-08-04)')
  const { makeFakeSupabase } = await import('./fake-supabase')
  const { emitStoaGatedTrustEvents } = await import('../trust-core-store')

  // G1 — a domain with NO prior state: the event is ledgered but HELD (not
  // folded). No agent_trust_state row is created at all — the public trust
  // record stays honestly absent (contrast the pre-fold behaviour, which
  // would have seeded+floored it).
  {
    const fake = makeFakeSupabase()
    const event = deriveStoaContradictionEvents({
      agentId: 'sagereasoning:demo@v1',
      ownerUserId: null,
      credentialRef: 'api_key:test',
      stoaEntryId: 'entry-1',
      claimQuote: 'claim',
      contradictsOversight: { artifactRef: 'signed:key1', justification: 'simply false', correlationId: 'corr-g1' },
      now: NOW,
    })[0]
    const result = await emitStoaGatedTrustEvents([event], fake.client)
    check('G.1a a fresh domain (no prior state): written:1, held:1', result.ok && result.value.written === 1 && result.value.held === 1)
    check('G.1b the event IS ledgered (finding preserved)', fake.tables.agent_trust_events.length === 1)
    check(
      'G.1c NO agent_trust_state row is created — the public record stays absent, never seeded-then-floored',
      fake.tables.agent_trust_state.length === 0,
    )
  }

  // G2 — a domain WITH prior independent evidence: the event applies
  // normally (narrows/corrects the existing record).
  {
    const fake = makeFakeSupabase()
    // Seed independent evidence: a prior justice-surface event (NOT from
    // Stoa, NOT this contradiction event) that already moved the domain off
    // its profile prior.
    fake.tables.agent_trust_state.push({
      id: 'seed-1',
      agent_id: 'sagereasoning:demo@v1',
      virtue_domain: 'oversight',
      earned_level: 'deliberate',
      profile_prior: 'habitual',
      volatility_rating: 'high',
      last_domain_activity_at: '2026-08-01T00:00:00Z',
      reflect_last_honest_at: null,
      justice_floor_active: false,
      coverage_status: null,
    })
    const event = deriveStoaContradictionEvents({
      agentId: 'sagereasoning:demo@v1',
      ownerUserId: null,
      credentialRef: 'api_key:test',
      stoaEntryId: 'entry-1',
      claimQuote: 'claim',
      contradictsOversight: { artifactRef: 'signed:key1', justification: 'simply false', correlationId: 'corr-g2' },
      now: NOW,
    })[0]
    const result = await emitStoaGatedTrustEvents([event], fake.client)
    check('G.2a a domain WITH independent evidence: written:1, held:0', result.ok && result.value.written === 1 && result.value.held === 0)
    const row = fake.tables.agent_trust_state.find((r) => r.virtue_domain === 'oversight')
    check('G.2b the fold applied — earned_level moved from the seeded deliberate (one rank down)', row?.earned_level === 'habitual')
  }

  // G3 — the null-domain refusal: emitStoaGatedTrustEvents must never
  // silently route a null-domain event into the reflect-wide fold (the
  // structural safeguard, even though neither current Stoa deriver can
  // produce one).
  {
    const fake = makeFakeSupabase()
    const originalError = console.error
    let loggedRefusal = false
    console.error = (...args: unknown[]) => {
      if (args.join(' ').includes('refusing a null-domain event')) loggedRefusal = true
    }
    const result = await emitStoaGatedTrustEvents(
      [
        {
          agentId: 'sagereasoning:demo@v1',
          virtueDomain: null,
          eventType: 'stoa-claim-contradicted-oversight',
          artifactKind: 'stoa_examined_artifact',
          artifactRef: 'x',
          payload: {},
          occurredAt: NOW.toISOString(),
          correlationId: 'corr-g3',
          ownerUserId: null,
          credentialRef: null,
        },
      ],
      fake.client,
    )
    console.error = originalError
    check('G.3a a null-domain event is refused, not silently routed', result.ok && result.value.written === 0)
    check('G.3b the refusal is logged (fail-honest, never silent)', loggedRefusal)
  }

  // G4 — Q13(a) shares the identical gate (explicit per the mentor, even
  // though the flag effect alone would not have tripped the pre-fix bug).
  {
    const fake = makeFakeSupabase()
    const event = deriveStoaCallingDivergenceEvent({
      agentId: 'sagereasoning:demo@v1',
      ownerUserId: null,
      credentialRef: 'api_key:test',
      stoaEntryId: 'entry-1',
      callingRecordRef: 'collab:orch|task-1',
      divergenceDescription: 'diverges',
      now: NOW,
      correlationId: 'corr-g4',
    })
    const result = event ? await emitStoaGatedTrustEvents([event], fake.client) : null
    check('G.4a Q13(a) on a fresh domain: written:1, held:1 (identical gate)', result !== null && result.ok && result.value.written === 1 && result.value.held === 1)
    check('G.4b no agent_trust_state row created for the flag event either', fake.tables.agent_trust_state.length === 0)
  }
}

async function main() {
  await runEvidenceGateSection()
  await runFlagGatingLegs()
  console.log(`\nstoa-trust-events battery: ${pass} passed, ${fail} failed`)
  if (fail > 0) process.exit(1)
}

main()
