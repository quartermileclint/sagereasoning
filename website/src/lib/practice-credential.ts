/**
 * practice-credential.ts — CI-14 Unified Practice Credential (UPC): the single
 * capability-checking chokepoint.
 *
 * STATUS: NEW (2026-06-15, CI-14 Critical build — the credential-consolidation
 * track). Implements ADR `adopted/adr/2026-06-14-credential-consolidation.md`
 * Decision §2 + Migration §4. Ships DARK behind SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED:
 * when the flag is UNSET, NOTHING in this module runs in production — the three
 * legacy validators keep their exact current bodies (byte-identical). When the
 * founder elects the flip (Step 6, a separate 0c-ii), the three validators
 * delegate their AUTH decision here.
 *
 * WHAT THIS IS: one indexed key_hash lookup of the active row → is_active
 * (universal revocation, unchanged) → requiredCapability ∈ COALESCE(capabilities,
 * preset_for(purpose)) else insufficient_capability → optional agent_id binding →
 * optional credential scope (the sage_assent_write scope_* columns). The opaque-
 * bearer + SHA-256 + is_active primitive is REUSED verbatim (same as security.ts /
 * plugin-install-auth.ts). The pure decision is factored into
 * evaluatePracticeCredentialRow (PR2 — unit-testable with no I/O).
 *
 * WHAT THIS IS NOT: it does not do quota/usage metering (that stays in
 * validateApiKey), the install_scope rank check (that stays in
 * validatePluginInstallToken), header/transport extraction (callers extract +
 * pass a raw token; per-capability transport narrowing stays at the call-site —
 * constraint 7), or any R18f/R20a/distress/signing work (untouched — capability
 * checking is ADDITIVE to the R18f provenance gate).
 *
 * GOVERNING DOCUMENTS: the CI-14 ADR; /manifest.md §AC7 (auth surface, Critical) /
 * §R18f / §R3 / §R17; the K1 ADR (composite identity); the A10 token-format ADR
 * (opaque-bearer election, reaffirmed).
 */

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

// =============================================================================
// CAPABILITY VOCABULARY (closed set — mirrors the api_keys_capabilities_subset_check)
// =============================================================================

/** The closed capability vocabulary. A credential's capabilities[] is a subset. */
export const PRACTICE_CAPABILITIES = [
  'consult',
  'l1_supply',
  'accreditation_write',
  'calling',
  'reflect',
] as const

export type PracticeCapability = (typeof PRACTICE_CAPABILITIES)[number]

/**
 * The WRITE-CLASS capabilities — those that bind agent_id at the write boundary and
 * therefore REQUIRE owner+agent. This list MUST match the 6e-broadened DB CHECK
 * `api_keys_sage_assent_write_requires_owner_and_agent`
 * (capabilities && ARRAY['accreditation_write','calling','reflect']). Changing one
 * without the other re-opens the opaque-500-vs-clear-400 gap the mint pre-validation
 * closes.
 */
export const WRITE_CLASS_CAPABILITIES: PracticeCapability[] = [
  'accreditation_write',
  'calling',
  'reflect',
]

/** Does this capability set include any write-class member ⇒ the row must carry
 *  owner_user_id + agent_id (enforced by the validator at auth time and, post-6e §A,
 *  by the DB CHECK at mint time). The mint route pre-validates with this so a
 *  write-class UPC without owner+agent gets a clear 400, not an opaque insert 500. */
export function capabilitiesIncludeWriteClass(capabilities: readonly string[]): boolean {
  return capabilities.some((c) =>
    (WRITE_CLASS_CAPABILITIES as readonly string[]).includes(c),
  )
}

/** The new UPC prefix for newly-minted unified practice credentials (cosmetic/diagnostic). */
export const UNIFIED_PRACTICE_CREDENTIAL_PREFIX = 'sr_prac_'

/** The four prefixes the widened extractors recognise (all keep validating). */
export const ALL_CREDENTIAL_PREFIXES = [
  'sr_live_',
  'sr_inst_',
  'sr_assent_',
  UNIFIED_PRACTICE_CREDENTIAL_PREFIX,
] as const

/**
 * The flag. UNSET (or any value !== 'true') = byte-identical: the legacy
 * validators keep their current purpose-filter bodies and never call into here.
 * Read at call time (never cached) so the founder's flip takes effect without a
 * redeploy, mirroring isL3DeferEnabled and the other substrate flags.
 */
export function isUpcCapabilityAuthEnabled(): boolean {
  return process.env.SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED === 'true'
}

// =============================================================================
// CAPABILITY DERIVATION — COALESCE(capabilities, preset_for(purpose))
// =============================================================================

/**
 * preset_for(purpose): the legacy-purpose → capability mapping. This is the
 * authoritative fallback for rows whose capabilities[] is still NULL (every row
 * minted before the Step-2 backfill, and any row the backfill has not reached).
 * It MUST match the Step-2 backfill mapping exactly, or a flag-on read would
 * diverge from the backfilled data:
 *   ecosystem        → {consult, l1_supply}
 *   plugin_install   → {consult, l1_supply}
 *   sage_assent_write→ {accreditation_write, calling, reflect}
 *   unified_practice / null / unknown → {} (a UPC row ALWAYS carries an explicit
 *     capabilities[]; if it somehow does not, it grants nothing — fail-closed).
 */
export function presetForPurpose(purpose: string | null | undefined): PracticeCapability[] {
  switch (purpose) {
    case 'ecosystem':
      return ['consult', 'l1_supply']
    case 'plugin_install':
      return ['consult', 'l1_supply']
    case 'sage_assent_write':
      return ['accreditation_write', 'calling', 'reflect']
    default:
      // 'unified_practice', null, or any future/unknown value: no preset — the
      // row's own capabilities[] is authoritative (fail-closed if it is absent).
      return []
  }
}

/**
 * The authoritative capability set of a row: its explicit capabilities[] if set,
 * else the preset derived from its legacy purpose. This is the in-code
 * COALESCE(capabilities, preset_for(purpose)) the ADR specifies — zero-backfill
 * parity for legacy rows, explicit-set authority for UPC rows. Unknown members
 * (a capabilities[] value outside the vocabulary — the CHECK forbids it, but be
 * defensive) are filtered out.
 */
export function effectiveCapabilities(row: {
  capabilities?: string[] | null
  purpose?: string | null
}): PracticeCapability[] {
  const raw = row.capabilities ?? presetForPurpose(row.purpose ?? null)
  return raw.filter((c): c is PracticeCapability =>
    (PRACTICE_CAPABILITIES as readonly string[]).includes(c),
  )
}

/** Does this row grant the required capability? */
export function credentialHasCapability(
  row: { capabilities?: string[] | null; purpose?: string | null },
  required: PracticeCapability,
): boolean {
  return effectiveCapabilities(row).includes(required)
}

// =============================================================================
// THE CHOKEPOINT — validatePracticeCredential
// =============================================================================

/** The superset of columns the chokepoint lookup selects (covers all wrappers). */
export const PRACTICE_CREDENTIAL_SELECT =
  'id, is_active, purpose, capabilities, owner_user_id, agent_id, label, tier, ' +
  'suspended_reason, monthly_limit, daily_limit, max_chain_iterations, ' +
  'scope_downstream_identity_model, scope_path_posture, ' +
  'identity_type, install_id, install_scope'

/** The looked-up row shape (the superset). Nullable fields reflect the column nullability. */
export interface PracticeCredentialRow {
  id: string
  is_active: boolean
  purpose: string | null
  capabilities: string[] | null
  owner_user_id: string | null
  agent_id: string | null
  label: string | null
  tier: 'free' | 'paid' | null
  suspended_reason: string | null
  monthly_limit: number | null
  daily_limit: number | null
  max_chain_iterations: number | null
  scope_downstream_identity_model: string | null
  scope_path_posture: string | null
  identity_type: string | null
  install_id: string | null
  install_scope: string | null
}

/** The reasons a credential check can fail. The CALLER collapses these to a single
 *  status for the wire (no info leak); the reason is for the structured audit log. */
export type PracticeCredentialReason =
  | 'no_token' // wrong/absent prefix — returns before any DB hit
  | 'invalid_token' // hash lookup returned no row (unknown), or a query error (fail-closed)
  | 'suspended' // row found but is_active = false (universal revocation)
  | 'insufficient_capability' // active, but requiredCapability ∉ effective capabilities
  | 'wrong_agent' // active + capable, but binds a different agent_id
  | 'wrong_scope' // agent matches, but a non-null scope column ≠ the supplied value

export type PracticeCredentialResult =
  | { valid: true; row: PracticeCredentialRow; capabilities: PracticeCapability[] }
  | { valid: false; reason: PracticeCredentialReason; suspendedReason?: string | null }

/** Optional binding/scope context for capabilities that require it. */
export interface PracticeScopeContext {
  /** When provided, the row's agent_id must equal it (write/calling/reflect binding). */
  agent_id?: string
  /** When the row carries non-null scope columns, the supplied values must match (fail-closed). */
  carriedProfile?: { downstream_identity_model?: string; path_posture?: string }
}

/**
 * PURE decision (no I/O) — the unit-testable core. Given the looked-up row (or
 * null), the required capability, and optional binding/scope context, decide.
 *
 * Order (matches the legacy paths' intent): null → invalid_token; !is_active →
 * suspended (validateApiKey surfaces suspended_reason; the assent/plugin wrappers
 * collapse it to their no-leak invalid_token); capability gate; agent binding;
 * scope (permissive when the column is NULL, fail-closed when set — exactly
 * evaluateSageAssentWriteRow's Decision 3a semantic, preserved).
 */
export function evaluatePracticeCredentialRow(
  row: PracticeCredentialRow | null,
  requiredCapability: PracticeCapability,
  ctx?: PracticeScopeContext,
): PracticeCredentialResult {
  if (!row) {
    return { valid: false, reason: 'invalid_token' }
  }
  if (!row.is_active) {
    return { valid: false, reason: 'suspended', suspendedReason: row.suspended_reason }
  }
  const caps = effectiveCapabilities(row)
  if (!caps.includes(requiredCapability)) {
    return { valid: false, reason: 'insufficient_capability' }
  }
  if (ctx?.agent_id !== undefined && row.agent_id !== ctx.agent_id) {
    return { valid: false, reason: 'wrong_agent' }
  }
  if (
    row.scope_downstream_identity_model !== null &&
    ctx?.carriedProfile?.downstream_identity_model !== row.scope_downstream_identity_model
  ) {
    return { valid: false, reason: 'wrong_scope' }
  }
  if (
    row.scope_path_posture !== null &&
    ctx?.carriedProfile?.path_posture !== row.scope_path_posture
  ) {
    return { valid: false, reason: 'wrong_scope' }
  }
  return { valid: true, row, capabilities: caps }
}

/**
 * The async chokepoint: hash → one indexed key_hash lookup (NO purpose filter —
 * capability is read from the row regardless of prefix/purpose; NO is_active
 * filter — so a revoked row surfaces 'suspended' to validateApiKey, which the
 * assent/plugin wrappers then collapse) → evaluatePracticeCredentialRow.
 *
 * The caller is responsible for transport extraction + the prefix check (so the
 * per-capability transport narrowing stays at the call-site — constraint 7).
 *
 * KG1 rule 2: the read is awaited; a query error is fail-closed (invalid_token).
 * The Supabase client is constructed inside the function (not at module load) so
 * pure-function tests import this module without real credentials.
 */
export async function validatePracticeCredential(
  rawToken: string,
  requiredCapability: PracticeCapability,
  ctx?: PracticeScopeContext,
): Promise<PracticeCredentialResult> {
  const keyHash = createHash('sha256').update(rawToken).digest('hex')

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: row, error } = await admin
    .from('api_keys')
    .select(PRACTICE_CREDENTIAL_SELECT)
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (error) {
    return { valid: false, reason: 'invalid_token' }
  }

  return evaluatePracticeCredentialRow(
    (row as unknown as PracticeCredentialRow | null) ?? null,
    requiredCapability,
    ctx,
  )
}
