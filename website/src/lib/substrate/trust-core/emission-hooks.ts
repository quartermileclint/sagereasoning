/**
 * emission-hooks.ts — the flag-gated, fail-honest call sites that turn a
 * completed examination into trust events (measure mode). These are invoked from
 * the accreditation write path + the reflect completion path. They:
 *   - no-op immediately when SUBSTRATE_TRUST_CORE_ENABLED is off (byte-identical);
 *   - NEVER throw to the caller (a trust-write failure must not 500 a live route —
 *     measure mode, log-and-continue);
 *   - enforce the R18f-parallel rule (no event without a verifiable artifact — the
 *     credential path rides on the R18f-verified write; the deriver additionally
 *     re-verifies each signed assessment; the reflect path gates on honest
 *     completion signals).
 *
 * Owner/credential identity is resolved from the credential (reusing the
 * agent_assessment_history-store resolver) so the events are reachable by the
 * user-JWT data-rights paths (/api/user/delete + /api/user/export by owner) and
 * consumer-erasure (/api/credential/erase by credential_ref). Identity resolution
 * only runs behind the flag.
 */

import { createHash } from 'crypto'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import { resolveCredentialContext } from '../agent-assessment-history-store'
import { isTrustCoreEnabled, isStoaTrustEventsEnabled } from './trust-core-flag'
import {
  deriveCredentialAndJusticeEvents,
  deriveReflectEvent,
  deriveScreenedReflectEvent,
  deriveSuppressionWatchEvents,
  deriveStoaContradictionEvents,
  deriveStoaCallingDivergenceEvent,
  deriveOrientationReadingEvent,
  type SurfacedPassion,
  type StoaContradictionAssertion,
} from './derive-trust-events'
import {
  emitTrustEvents,
  emitStoaGatedTrustEvents,
  emitLedgerOnlyTrustEvents,
} from './trust-core-store'
import { isOrientationReadingEnabled } from '@/lib/translation-sandwich/orientation-reading'
import { isAgentCirclesEnabled } from '@/lib/translation-sandwich/reasoning-integrity'
import type { OrientationObservation } from '@/lib/translation-sandwich/layer1-extractor'

/** Extract the provenance.signed_assessments array from a parsed write body,
 *  defensively (returns [] on any shape mismatch). */
function extractSignedAssessments(rawBody: unknown): SignedLayer2Assessment[] {
  if (typeof rawBody !== 'object' || rawBody === null) return []
  const prov = (rawBody as { provenance?: unknown }).provenance
  if (typeof prov !== 'object' || prov === null) return []
  const arr = (prov as { signed_assessments?: unknown }).signed_assessments
  return Array.isArray(arr) ? (arr as SignedLayer2Assessment[]) : []
}

export interface AccreditationEmissionInput {
  agentId: string
  credentialId: string
  /** The R18f gate's `enforced` flag — TRUE only when a signed assessment was
   *  cryptographically verified at the write boundary. The credential-path trust
   *  event rides on the R18f-verified write, so emission requires it. */
  provenanceEnforced: boolean
  rawBody: unknown
  now?: Date
  /** AE-2 dedup: when the route already resolved the credential's owner (the
   *  loop-fold flag's identity read), pass it here to skip this module's own
   *  resolveCredentialContext PK read. `undefined` ⇒ resolve internally
   *  (byte-identical to pre-AE-2); `null` is a RESOLVED owner-less result. */
  resolvedOwnerUserId?: string | null
}

/**
 * Emit credential-completed (+ one justice-surface) trust events from an
 * R18f-verified accreditation write. Fully guarded; returns void; never throws.
 */
export async function emitAccreditationTrustEvents(
  input: AccreditationEmissionInput,
): Promise<void> {
  try {
    if (!isTrustCoreEnabled()) return
    // R18f-parallel: only an examination-verified write yields trust events.
    if (!input.provenanceEnforced) return

    const signedAssessments = extractSignedAssessments(input.rawBody)
    if (signedAssessments.length === 0) return

    const now = input.now ?? new Date()
    const owner_user_id =
      input.resolvedOwnerUserId !== undefined
        ? input.resolvedOwnerUserId
        : (await resolveCredentialContext(input.credentialId)).owner_user_id
    const credentialRef = `api_key:${input.credentialId}`

    // Deterministic idempotency key: a content hash of the write's signatures, so
    // a retried write dedupes. Sorted before hashing — the signatures array's
    // order is a submission-order artifact, not evidence identity, so an
    // identical evidence set resubmitted in a different order must still
    // collapse to the same key (else it bypasses the unique-index dedup and
    // double-counts one accreditation write as two).
    const sigDigest = createHash('sha256')
      .update(
        input.agentId +
          '|' +
          signedAssessments
            .map((s) => s.signature)
            .slice()
            .sort()
            .join('|'),
      )
      .digest('hex')
      .slice(0, 32)
    const correlationId = `accr:${sigDigest}`

    const events = deriveCredentialAndJusticeEvents({
      agentId: input.agentId,
      ownerUserId: owner_user_id,
      credentialRef,
      signedAssessments,
      now,
      correlationId,
    })
    if (events.length === 0) return
    await emitTrustEvents(events)
  } catch (e) {
    // Fail-honest: log + swallow. Measure mode — the live write is unaffected.
    console.error('[trust-core] emitAccreditationTrustEvents error:', (e as Error).message)
  }
}

export interface ReflectEmissionInput {
  agentId: string
  /** The reflect credential (from verifyReflectToken); null if unknown. */
  credentialId: string | null
  sessionId: string
  fabricationRiskLevel: 'low' | 'moderate' | 'high'
  contextSource: 'agent_stated' | 'harness_inferred' | null
  now?: Date
}

export interface ScreenedReflectEmissionInput {
  agentId: string
  credentialId: string | null
  sessionId: string
  contextSource: 'agent_stated' | 'harness_inferred' | null
  verbatimLength: number
  now?: Date
}

/**
 * S9b G2 — emit a reflect-screened-honest trust event when the harness's forced
 * single review turn lands its agent-stated verbatim persist (the Q1 turn of an
 * agent_stated session). Honesty gates live in the deriver (agent_stated +
 * non-empty verbatim). Fully guarded; returns void; never throws. DARK until the
 * S9b CHECK widening (the insert is rejected loudly, never fabricated).
 */
export async function emitScreenedReflectTrustEvent(
  input: ScreenedReflectEmissionInput,
): Promise<void> {
  try {
    if (!isTrustCoreEnabled()) return
    const now = input.now ?? new Date()
    const owner = input.credentialId
      ? await resolveCredentialContext(input.credentialId)
      : { owner_user_id: null }
    const event = deriveScreenedReflectEvent({
      agentId: input.agentId,
      ownerUserId: owner.owner_user_id,
      credentialRef: input.credentialId ? `api_key:${input.credentialId}` : null,
      sessionId: input.sessionId,
      contextSource: input.contextSource,
      verbatimLength: input.verbatimLength,
      now,
      correlationId: `reflect-screened:${input.sessionId}`,
    })
    if (event === null) return
    await emitTrustEvents([event])
  } catch (e) {
    console.error('[trust-core] emitScreenedReflectTrustEvent error:', (e as Error).message)
  }
}

export interface SuppressionWatchEmissionInput {
  agentId: string
  credentialId: string | null
  sessionId: string
  /** Passions the agent surfaced in reflect Q4 (root + sub-species per entry). */
  q4Passions: SurfacedPassion[]
  /** The session's signed assessments as supplied at open (opaque; the deriver
   *  Ed25519-verifies each — R18f-parallel). */
  sessionAssessments: unknown[]
  screenRanDeclared: boolean
  now?: Date
}

/**
 * S9b G4 — the suppression watch, called by the reflect service at completion.
 * Emits passion-unflagged-by-self-screen (screen ran and missed, 3-part
 * standard) or self-screen-absent (no screen evidence) per the deriver. Fully
 * guarded; returns void; never throws.
 */
export async function emitSuppressionWatchEvents(
  input: SuppressionWatchEmissionInput,
): Promise<void> {
  try {
    if (!isTrustCoreEnabled()) return
    if (input.q4Passions.length === 0) return // nothing surfaced ⇒ no signal either way
    const now = input.now ?? new Date()
    const owner = input.credentialId
      ? await resolveCredentialContext(input.credentialId)
      : { owner_user_id: null }
    const events = deriveSuppressionWatchEvents({
      agentId: input.agentId,
      ownerUserId: owner.owner_user_id,
      credentialRef: input.credentialId ? `api_key:${input.credentialId}` : null,
      sessionId: input.sessionId,
      q4Passions: input.q4Passions,
      sessionAssessments: input.sessionAssessments as SignedLayer2Assessment[],
      screenRanDeclared: input.screenRanDeclared,
      now,
      correlationId: `suppression:${input.sessionId}`,
    })
    if (events.length === 0) return
    await emitTrustEvents(events)
  } catch (e) {
    console.error('[trust-core] emitSuppressionWatchEvents error:', (e as Error).message)
  }
}

/**
 * Emit a reflect-completed-honest trust event from an honest reflect completion
 * (context_source = agent_stated + fabrication_risk != high — enforced in the
 * deriver). Fully guarded; returns void; never throws.
 */
export async function emitReflectTrustEvent(input: ReflectEmissionInput): Promise<void> {
  try {
    if (!isTrustCoreEnabled()) return

    const now = input.now ?? new Date()
    const owner = input.credentialId
      ? await resolveCredentialContext(input.credentialId)
      : { owner_user_id: null }
    const credentialRef = input.credentialId ? `api_key:${input.credentialId}` : null

    const event = deriveReflectEvent({
      agentId: input.agentId,
      ownerUserId: owner.owner_user_id,
      credentialRef,
      sessionId: input.sessionId,
      fabricationRiskLevel: input.fabricationRiskLevel,
      contextSource: input.contextSource,
      now,
      correlationId: `reflect:${input.sessionId}`,
    })
    if (event === null) return // dishonest completion — not a trust-positive artifact
    await emitTrustEvents([event])
  } catch (e) {
    console.error('[trust-core] emitReflectTrustEvent error:', (e as Error).message)
  }
}

export interface StoaContradictionEmissionInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  stoaEntryId: string
  claimQuote: string
  /** Each assertion carries its OWN correlationId (PR19 fold, 2026-08-04) —
   *  there is deliberately no submission-level correlation id on this input;
   *  see StoaContradictionAssertion's docstring. */
  contradictsOversight?: StoaContradictionAssertion
  contradictsDikaiosyne?: StoaContradictionAssertion
  now?: Date
}

/**
 * Stoa Q5(c) — emit the claim-contradicted trust event(s) from an admin-flagged
 * examined-use artifact. Gated behind BOTH SUBSTRATE_TRUST_CORE_ENABLED AND
 * SUBSTRATE_STOA_TRUST_EVENTS_ENABLED (founder election E2 — a false positive
 * here writes a permanent ledger row even in measure mode). Fully guarded;
 * returns the written/held counts for the CALLER to surface honestly (the
 * admin intake route, unlike the other emission hooks, must tell the
 * submitting admin what actually happened — never throws, never silently
 * drops).
 *
 * EVIDENCE-GATED (2026-08-04 mentor ruling, verbatim record:
 * operations/connective-layer-2026-08/2026-08-04-mentor-consultation-stoa-
 * followups-verbatim.md): "a contradiction event narrows or corrects an
 * existing record; it does not by itself create one." Routes through
 * emitStoaGatedTrustEvents (NOT the generic emitTrustEvents every other
 * event type uses) — every event is still LEDGERED, but a domain with no
 * independent examined evidence has its event HELD (recorded, not folded
 * into the public trust record). `held` in the return value surfaces this
 * honestly to the submitting admin, distinct from `written` — a nonzero
 * `held` means the finding was preserved but did NOT change the agent's
 * public record.
 */
export async function emitStoaContradictionTrustEvents(
  input: StoaContradictionEmissionInput,
): Promise<{ written: number; held: number } | { error: string }> {
  try {
    if (!isTrustCoreEnabled() || !isStoaTrustEventsEnabled()) return { written: 0, held: 0 }

    const now = input.now ?? new Date()
    const events = deriveStoaContradictionEvents({
      agentId: input.agentId,
      ownerUserId: input.ownerUserId,
      credentialRef: input.credentialRef,
      stoaEntryId: input.stoaEntryId,
      claimQuote: input.claimQuote,
      contradictsOversight: input.contradictsOversight,
      contradictsDikaiosyne: input.contradictsDikaiosyne,
      now,
    })
    if (events.length === 0) return { written: 0, held: 0 }
    const result = await emitStoaGatedTrustEvents(events)
    if (!result.ok) return { error: result.error }
    return { written: result.value.written, held: result.value.held }
  } catch (e) {
    const error = `emitStoaContradictionTrustEvents threw: ${(e as Error).message}`
    console.error('[trust-core] ' + error)
    return { error }
  }
}

export interface StoaCallingDivergenceEmissionInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  stoaEntryId: string
  callingRecordRef: string
  divergenceDescription: string
  now?: Date
  correlationId: string
}

/**
 * Stoa Q13(a) — emit the declaration-diverges-from-calling flag event.
 * Gated identically to the contradiction emitter above. 'flag' effect — never
 * raises or lowers a domain level on its own (see trust-transition.ts); still
 * gated behind both flags because the row itself (and its artifact_ref
 * pairing) is a standing, permanent record even though it changes no trust
 * level.
 *
 * EVIDENCE-GATED identically to the contradiction path (2026-08-04 mentor
 * ruling — see the contradiction emitter's docstring; the mentor stated this
 * explicitly for Q13(a) too, "regardless of whether the current flag
 * mechanism would trip it," because the flag path's non-effect on the seeded
 * state is "an implementation coincidence, not a principled constraint" that
 * a future mechanism change could inadvertently remove).
 */
export async function emitStoaCallingDivergenceTrustEvent(
  input: StoaCallingDivergenceEmissionInput,
): Promise<{ written: number; held: number } | { error: string }> {
  try {
    if (!isTrustCoreEnabled() || !isStoaTrustEventsEnabled()) return { written: 0, held: 0 }

    const now = input.now ?? new Date()
    const event = deriveStoaCallingDivergenceEvent({
      agentId: input.agentId,
      ownerUserId: input.ownerUserId,
      credentialRef: input.credentialRef,
      stoaEntryId: input.stoaEntryId,
      callingRecordRef: input.callingRecordRef,
      divergenceDescription: input.divergenceDescription,
      now,
      correlationId: input.correlationId,
    })
    if (event === null) return { written: 0, held: 0 }
    const result = await emitStoaGatedTrustEvents([event])
    if (!result.ok) return { error: result.error }
    return { written: result.value.written, held: result.value.held }
  } catch (e) {
    const error = `emitStoaCallingDivergenceTrustEvent threw: ${(e as Error).message}`
    console.error('[trust-core] ' + error)
    return { error }
  }
}

export interface OrientationReadingEmissionInput {
  agentId: string
  credentialId: string
  /** The credential's resolved owner (the route's sharedCredCtx — resolved ONCE
   *  per consult, the AE-1/AE-2 KG1 dedup discipline; this hook performs no
   *  resolveCredentialContext read of its own). */
  ownerUserId: string | null
  /** The signed Layer-2 assessment of THIS examination (from the consult
   *  response's own assessment envelope — re-verified in the deriver). */
  signedAssessment: unknown
  /** The SERVER-side extraction's orientation observations (absent ⇒
   *  'indeterminate'). */
  observations: readonly { observed: string; evidence: string }[] | null | undefined
  /** Engaged circle names from the same extraction (the C2(ii) seed's
   *  population condition). */
  engagedCircles: readonly string[]
  /** TRUE Layer-1 provenance ('supplied' iff preExtractedLayer1Schema was set —
   *  the AE-1 stamp's own rule). The hook refuses 'supplied': a caller-supplied
   *  extraction can never mint an orientation reading (the gaming ceiling's
   *  structural half; the route additionally 400s the field on the l1_supply
   *  path flag-on). */
  layer1Source: 'server' | 'supplied'
  /** REQUIRED (2026-08-08 examined/observed fold) — elapsed ms from request
   *  receipt (route.ts's `requestReceivedAtMs`) to this call. Threaded
   *  straight to the deriver's classifyOrientationDelivery; see
   *  OrientationReadingInput.elapsedMs for the full rationale. */
  elapsedMs: number
  /** QG-C (ruled 2026-08-09) — the caller's declared IDEA-loop instance label,
   *  flag-gated + validated at the route (`substrate/loop-id-field.ts`).
   *  Optional; threaded straight to the deriver, which stamps it verbatim as
   *  its own payload field. This hook neither validates nor interprets it — a
   *  passthrough label, per the ruling. */
  loopId?: string
  now?: Date
}

/**
 * PR19 re-run fold (2026-08-08, `wf_63ff4a50-a2a`, CONFIRMED medium — F-2's
 * fix "closes a real cross-agent collision" but "is unverified by any
 * automated test... the digest-construction line is never independently
 * exercised"; a reviewer mutation-tested this by reverting the fix and found
 * both batteries stayed green). Extracted to a PURE, directly-testable
 * function so a regression that drops the agent-id salt (silently reopening
 * the exact cross-agent `uq_ate_correlation` collision the fold closes — that
 * index is `(correlation_id, event_type, COALESCE(virtue_domain,...))`, no
 * agent_id column) fails a battery instead of passing one.
 *
 * Injective on the LIVE call site's inputs: `agentId` is always pre-filtered
 * through `isAcceptedAgentId` (neither CANONICAL_AGENT_ID_PATTERN nor
 * LEGACY_AGENT_ID_PATTERN admits `|`) and `signature` is base64 (alphabet
 * excludes `|`) — so the pipe delimiter cannot appear in either component on
 * any path this codebase's own vocabulary accepts today. Not re-derived here
 * (the PR19 re-run's own low-severity residual, disclosed, not re-litigated).
 */
export function computeOrientationCorrelationId(agentId: string, signature: string): string {
  return (
    'orient:' +
    createHash('sha256').update(agentId + '|' + signature).digest('hex').slice(0, 32)
  )
}

/**
 * Agent-circles C1c (2026-08-08) — emit the per-examination orientation-reading
 * event from a credential-bearing /api/reason consult. Gated behind BOTH
 * SUBSTRATE_TRUST_CORE_ENABLED and SUBSTRATE_ORIENTATION_READING_ENABLED.
 * Fully guarded; returns void; never throws (measure mode — the consult
 * response is unaffected by any failure here, and carries no trace of the
 * reading either way per the C2c placement ruling).
 *
 * PR19 re-run fold (2026-08-08, CONFIRMED low): the agent-circles AND was
 * enforced only at the route.ts call site — "single-point-of-enforcement, not
 * defense-in-depth". Re-checked HERE too, so the reusable exported hook is
 * self-defending against any future second call site that omits the route's
 * own guard.
 *
 * EMISSION PATH (load-bearing): emitLedgerOnlyTrustEvents — INSERT-ONLY, never
 * the generic emitTrustEvents, whose null-domain branch would stamp the reflect
 * timestamp and grant half-rate decay (see trust-core-store.ts). Idempotency:
 * `orient:<sha256 digest of agentId|signature>` (computeOrientationCorrelationId
 * above) — one examination, at most one ledgered reading, dedup enforced by
 * the uq_ate_correlation index (COALESCE(virtue_domain,'__agent_wide__')
 * covers the NULL domain).
 */
export async function emitOrientationReadingTrustEvent(
  input: OrientationReadingEmissionInput,
): Promise<void> {
  try {
    if (!isTrustCoreEnabled() || !isOrientationReadingEnabled() || !isAgentCirclesEnabled()) return
    if (input.layer1Source !== 'server') return // supplied extractions never mint a reading

    const signed = input.signedAssessment as SignedLayer2Assessment | null | undefined
    if (!signed || typeof signed.signature !== 'string' || signed.signature.length === 0) return

    const now = input.now ?? new Date()
    const correlationId = computeOrientationCorrelationId(input.agentId, signed.signature)

    const event = deriveOrientationReadingEvent({
      agentId: input.agentId,
      ownerUserId: input.ownerUserId,
      credentialRef: `api_key:${input.credentialId}`,
      signedAssessment: signed,
      observations: input.observations as readonly OrientationObservation[] | null | undefined,
      engagedCircles: input.engagedCircles,
      now,
      correlationId,
      elapsedMs: input.elapsedMs,
      // QG-C: passthrough only — note it is NOT an input to correlationId
      // above (computed from agentId + signature alone). The two identities
      // stay separate fields on one event, per the ruling.
      loopId: input.loopId,
    })
    if (event === null) return // unverifiable artifact — no event (R18f-parallel)
    await emitLedgerOnlyTrustEvents([event])
  } catch (e) {
    console.error('[trust-core] emitOrientationReadingTrustEvent error:', (e as Error).message)
  }
}
