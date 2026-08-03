/**
 * stoa-credential.ts — the ST4 agent-presence + agent-declare credential seam.
 *
 * Two distinct uses of the SAME UPC `consult` capability (the §5-item-ii
 * election, ST4 2026-08-03 — ride `consult` for v1 rather than mint a new
 * `declare` capability: no schema/mint change, and a dedicated capability
 * can be introduced later without breaking existing declarations, since the
 * store keys on agent_id, not capability):
 *
 *   1. PRESENCE (GET /api/stoa/entries) — dual transport (Bearer OR
 *      X-Api-Key), NO metering, NO usage-counter increment. This is a
 *      presence check ("is a credentialed agent looking"), never a consult
 *      action — calling security.ts's validateApiKey here would burn a real
 *      quota call just to browse a list, contradicting the browse route's
 *      own stated invariant ("presence check only — never a gate", #3).
 *      validatePracticeCredential is the metering-FREE UPC chokepoint; that
 *      is why this module calls it directly instead of going through
 *      validateApiKey. An absent or invalid credential resolves to `null` —
 *      never an error, never a gate — the caller falls back to public scope.
 *
 *   2. DECLARE (POST/GET/PATCH/DELETE /api/stoa/declare) — Bearer-ONLY (a
 *      mutating, identity-establishing surface; narrower than the general
 *      consult transport — per-capability transport narrowing is a
 *      call-site decision, practice-credential.ts's own "constraint 7";
 *      mirrors the discernment route's Bearer-only narrowing of the same
 *      capability). Requires an OWNER-BOUND credential
 *      (`row.owner_user_id !== null`) — the mentor's binding answer: the
 *      *developer* declares for an agent, and an owner-less credential has
 *      no accountable declarer (#13). The agent_id is taken EXCLUSIVELY from
 *      the credential's own binding (`row.agent_id`), NEVER from a request
 *      body — an agent cannot declare on another agent's behalf, and a
 *      caller-supplied identity is never trusted. K1-canonical form is
 *      enforced downstream by stoa-store's `validateIdentity` (defence in
 *      depth, not duplicated here).
 *
 * The ONE addition ST4 makes to stoa-boundary.test.ts §A's exact allowlist:
 * `@/lib/practice-credential` — a capability-checking chokepoint with no
 * trust-core/kathekon/practice-suggestion data flow (see that module's own
 * banner) — matching the module's existing single-purpose-import discipline.
 */

import type { NextRequest } from 'next/server'
import {
  validatePracticeCredential,
  ALL_CREDENTIAL_PREFIXES,
  type PracticeCapability,
  type PracticeCredentialResult,
} from '@/lib/practice-credential'

/** Injectable validator seam (mirrors DiscernmentRouteDeps's own pattern) —
 *  lets the pure decision logic below be battery-tested without a live DB or
 *  env. Defaults to the real chokepoint. */
export type StoaCredentialValidator = (
  raw: string,
  capability: PracticeCapability,
) => Promise<PracticeCredentialResult>

const defaultValidator: StoaCredentialValidator = (raw, capability) =>
  validatePracticeCredential(raw, capability)

/** Extract a raw credential token from the request. `apiKeyHeader: true`
 *  additionally accepts X-Api-Key (the presence-check dual-transport
 *  posture); `false` restricts to Authorization: Bearer (the declare-route
 *  narrowing). Any of the four UPC prefixes is accepted at the transport
 *  layer — the capability check downstream is what actually gates. */
function extractToken(request: NextRequest, opts: { apiKeyHeader: boolean }): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const raw = authHeader.slice('Bearer '.length).trim()
    if (raw && ALL_CREDENTIAL_PREFIXES.some((p) => raw.startsWith(p))) return raw
  }
  if (opts.apiKeyHeader) {
    const apiKeyHeader = request.headers.get('x-api-key')
    if (apiKeyHeader) {
      const raw = apiKeyHeader.trim()
      if (raw && ALL_CREDENTIAL_PREFIXES.some((p) => raw.startsWith(p))) return raw
    }
  }
  return null
}

export interface StoaCredentialPresence {
  /** The credential's own agent binding, if any — null for an owner-only
   *  (e.g. ecosystem) credential that presents no agent identity. */
  agentId: string | null
  credentialId: string
}

/**
 * Presence-only resolution for the browse route. Never throws, never
 * distinguishes "wrong credential" from "no credential" to the caller — the
 * browse route treats both identically (elevate scope, or don't; #3: never
 * a gate).
 */
export async function resolveStoaCredentialPresence(
  request: NextRequest,
  validate: StoaCredentialValidator = defaultValidator,
): Promise<StoaCredentialPresence | null> {
  const raw = extractToken(request, { apiKeyHeader: true })
  if (!raw) return null
  try {
    const result = await validate(raw, 'consult')
    if (!result.valid) return null
    return { agentId: result.row.agent_id, credentialId: result.row.id }
  } catch {
    return null
  }
}

export type StoaDeclareAuthFailure =
  | 'no_token'
  | 'invalid_token'
  | 'no_owner' // owner-less credential — no accountable declarer (#13)
  | 'no_agent' // credential carries no agent_id binding

export type StoaDeclareAuth =
  | { ok: true; agentId: string; credentialRef: string; ownerUserId: string }
  | { ok: false; reason: StoaDeclareAuthFailure }

/**
 * Declare-route auth: Bearer-only, `consult` capability, owner+agent bound.
 * The identity this resolves to is the ONLY identity stoa-store's
 * declare/read/update/withdraw calls ever see for an agent — never a
 * request-body value.
 */
export async function resolveStoaDeclareIdentity(
  request: NextRequest,
  validate: StoaCredentialValidator = defaultValidator,
): Promise<StoaDeclareAuth> {
  const raw = extractToken(request, { apiKeyHeader: false })
  if (!raw) return { ok: false, reason: 'no_token' }
  try {
    const result = await validate(raw, 'consult')
    if (!result.valid) return { ok: false, reason: 'invalid_token' }
    if (!result.row.owner_user_id) return { ok: false, reason: 'no_owner' }
    if (!result.row.agent_id) return { ok: false, reason: 'no_agent' }
    return {
      ok: true,
      agentId: result.row.agent_id,
      credentialRef: `api_key:${result.row.id}`,
      ownerUserId: result.row.owner_user_id,
    }
  } catch {
    return { ok: false, reason: 'invalid_token' }
  }
}
