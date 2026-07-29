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
import { isTrustCoreEnabled } from './trust-core-flag'
import {
  deriveCredentialAndJusticeEvents,
  deriveReflectEvent,
  deriveScreenedReflectEvent,
  deriveSuppressionWatchEvents,
  type SurfacedPassion,
} from './derive-trust-events'
import { emitTrustEvents } from './trust-core-store'

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
