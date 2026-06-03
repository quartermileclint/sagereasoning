/**
 * plugin-install-auth.ts — A10 per-install plugin-auth credentials (Surface 1).
 *
 * STATUS: Scaffolded → Verified as LIBRARY CODE (2026-06-03, A10 Stage-1 kickoff).
 * Imported by NO route — zero production exposure this session. The route wiring
 * (replacing checkPluginAuth's single PLUGIN_AUTH_SECRET on /api/reason) is the
 * Critical implementation session (staging-plan session 12); AC7 engages there,
 * not here. PR1: this is the single-endpoint proof of the per-install pattern as
 * library code BEFORE any route exposes it — exactly the precedent set by
 * sage-assent-accreditation-store.ts (D-ATL-BADGE-SCHEMA-PERSISTENCE-2026-05-15).
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/adr/2026-06-03-a10-token-format.md — the Token-Format ADR
 *     (Accepted 2026-06-03 by founder election). Surface 1 = opaque bearer token,
 *     DB-backed, instant revocation. Surface 2 (W3C-VC/AP2-mandate portable
 *     envelope) is deferred under PR7 and is NOT in this module.
 *   - /adopted/substrate-plugin-staging-plan.md §A10 — the build item.
 *   - /manifest.md §AC7 (auth surface; Critical at the route) / §R18f (no false
 *     credential) / §AC10 (provenance + use-policy tags, future).
 *
 * WHAT THIS MODULE IS
 *
 * It generalises the production-tested opaque-token mechanism that security.ts
 * already uses for sr_assent_ accreditation-write credentials, pointing it at the
 * plugin-auth surface and adding the A10 identity discrimination:
 *
 *   - identity_type  — 'human' | 'agent'          (who/what the install is)
 *   - install_id     — the per-install identifier  (replaces the shared secret)
 *   - install_scope  — 'assessment-only' | 'mentor-also' | 'admin'
 *
 * The UNIVERSAL REVOCATION CHECK is the `.eq('is_active', true)` filter on the
 * lookup: a revoked credential (is_active=false) returns no row and collapses to
 * 'invalid_token'. Revocation is therefore instant (an admin flips is_active) and
 * is checked on EVERY authenticated call — the A10 requirement the self-contained
 * formats (JWT/VC) could not satisfy without a separate list (see the ADR).
 *
 * Token shape: sr_inst_<32 hex>. Sent as `Authorization: Bearer sr_inst_<key>`
 * only. No claims travel in the token; the api_keys row carries them.
 *
 * DB: purpose='plugin_install' rows in public.api_keys (see
 * /website/supabase-api-keys-plugin-install-migration.sql — AUTHORED, not yet run;
 * the founder runs it at the Critical implementation session).
 */

import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'node:crypto'

/** The fixed namespace prefix for A10 per-install tokens (distinct from sr_live_ / sr_assent_). */
export const PLUGIN_INSTALL_TOKEN_PREFIX = 'sr_inst_'

/** Who/what an install authenticates as (A10 identity discrimination). */
export type PluginIdentityType = 'human' | 'agent'

/** The capability band a per-install credential is granted. */
export type PluginInstallScope = 'assessment-only' | 'mentor-also' | 'admin'

/** Scope ordering for the "at least" required-scope check (admin ⊇ mentor-also ⊇ assessment-only). */
const SCOPE_RANK: Record<PluginInstallScope, number> = {
  'assessment-only': 0,
  'mentor-also': 1,
  admin: 2,
}

/**
 * Discriminated result of validatePluginInstallToken.
 *
 * On success: the bound credential identifiers + the install's identity_type,
 * install_id, and granted scope (so the caller can log them and branch on
 * human-vs-agent behaviour). On failure: the specific reason. A ROUTE that wires
 * this in should collapse every failure to a single 401 to the caller (no info
 * leak); the specific reason is for the structured audit log.
 */
export type PluginInstallValidationResult =
  | {
      valid: true
      credential_id: string
      owner_user_id: string | null
      identity_type: PluginIdentityType
      install_id: string
      install_scope: PluginInstallScope
    }
  | {
      valid: false
      reason:
        | 'no_token' // missing/!Bearer or wrong (non-sr_inst_) prefix — returns before any DB hit
        | 'invalid_token' // hash lookup returned no active plugin_install row (unknown OR REVOKED — universal revocation check)
        | 'insufficient_scope' // credential is valid but its granted scope is below the endpoint's required scope
    }

/**
 * Generate a new per-install credential. Returns the raw token (shown to the
 * admin exactly once) and its SHA-256 hash (stored in api_keys.key_hash).
 * Shape: sr_inst_<32 hex>. Mirrors generateSageAssentWriteToken.
 */
export function generatePluginInstallToken(): { raw: string; hash: string } {
  const raw = `${PLUGIN_INSTALL_TOKEN_PREFIX}${randomBytes(16).toString('hex')}`
  const hash = createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

/** The minimal api_keys row shape the per-install verification path selects + reasons over. */
export interface PluginInstallCredentialRow {
  id: string
  owner_user_id: string | null
  identity_type: PluginIdentityType
  install_id: string
  install_scope: PluginInstallScope
}

/**
 * PURE decision: given the looked-up ACTIVE plugin_install row (or null) and the
 * endpoint's required scope (optional), decide the validation result. No I/O —
 * the unit-testable core of validatePluginInstallToken (factored per PR2).
 *
 * - null row (unknown token OR revoked — the lookup filters is_active=true, so
 *   the two collapse here by design: this IS the universal revocation check) →
 *   'invalid_token'.
 * - required scope (Decision: endpoint declares the minimum band it needs):
 *   permissive when requiredScope is undefined; otherwise the credential's
 *   granted scope must rank >= the required scope, else 'insufficient_scope'
 *   (fail-closed).
 */
export function evaluatePluginInstallRow(
  row: PluginInstallCredentialRow | null,
  requiredScope?: PluginInstallScope,
): PluginInstallValidationResult {
  if (!row) {
    return { valid: false, reason: 'invalid_token' }
  }
  if (requiredScope !== undefined && SCOPE_RANK[row.install_scope] < SCOPE_RANK[requiredScope]) {
    return { valid: false, reason: 'insufficient_scope' }
  }
  return {
    valid: true,
    credential_id: row.id,
    owner_user_id: row.owner_user_id,
    identity_type: row.identity_type,
    install_id: row.install_id,
    install_scope: row.install_scope,
  }
}

/**
 * Validate a per-install token, optionally enforcing a minimum endpoint scope.
 *
 * Prefix-rejects non-sr_inst_ tokens ('no_token'); otherwise hashes, looks up the
 * ACTIVE plugin_install row (the `.eq('is_active', true)` filter is the universal
 * revocation check), and delegates the decision to evaluatePluginInstallRow.
 *
 * KG1 rule 2: the Supabase read is awaited; a query error is treated as
 * 'invalid_token' (fail closed), not swallowed-and-allowed. The Supabase client
 * is constructed INSIDE the function (not at module load) so pure-function tests
 * import this module without needing real credentials.
 */
export async function validatePluginInstallToken(
  rawToken: string,
  requiredScope?: PluginInstallScope,
): Promise<PluginInstallValidationResult> {
  // Prefix check — wrong prefix is treated as no token (no DB hit).
  if (!rawToken.startsWith(PLUGIN_INSTALL_TOKEN_PREFIX)) {
    return { valid: false, reason: 'no_token' }
  }

  // Hash the presented token (same algorithm as the sr_live_ / sr_assent_ paths).
  const keyHash = createHash('sha256').update(rawToken).digest('hex')

  // Look up the active plugin_install row by hash (service role, bypasses RLS).
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: row, error } = await admin
    .from('api_keys')
    .select('id, owner_user_id, identity_type, install_id, install_scope')
    .eq('key_hash', keyHash)
    .eq('purpose', 'plugin_install')
    .eq('is_active', true) // ← universal revocation check
    .maybeSingle()

  // A query error is fail-closed (treated as no row → invalid_token).
  if (error) {
    return { valid: false, reason: 'invalid_token' }
  }

  return evaluatePluginInstallRow(
    (row as PluginInstallCredentialRow | null) ?? null,
    requiredScope,
  )
}

/**
 * Helper: extract a raw sr_inst_ token from an Authorization: Bearer header.
 * Returns null if absent or wrong scheme/prefix. (No DB hit.) Mirrors the
 * narrow-attack-surface posture of the sr_assent_ path: Bearer header only.
 */
export function extractPluginInstallToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null
  const bearer = `Bearer ${PLUGIN_INSTALL_TOKEN_PREFIX}`
  if (!authorizationHeader.startsWith(bearer)) return null
  return authorizationHeader.slice('Bearer '.length).trim()
}
