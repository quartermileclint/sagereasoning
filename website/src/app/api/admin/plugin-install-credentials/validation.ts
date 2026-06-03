/**
 * validation.ts — pure mint-input validation for the A10 plugin-install
 * credential admin endpoint (2026-06-03, A10 Critical implementation).
 *
 * Factored out of route.ts (Next.js route files may only export HTTP handlers)
 * so the validation logic is importable + unit-testable per PR2. Mirrors
 * /api/admin/accreditation-credentials/validation.ts.
 *
 * Surface 1 of the A10 Token-Format ADR
 * (/adopted/adr/2026-06-03-a10-token-format.md — Accepted 2026-06-03).
 */

import type {
  PluginIdentityType,
  PluginInstallScope,
} from '@/lib/plugin-install-auth'

/** Identity-type vocabulary (mirrors the api_keys identity_type CHECK). */
export const VALID_IDENTITY_TYPES = ['human', 'agent'] as const

/** Install-scope vocabulary (mirrors the api_keys install_scope CHECK). */
export const VALID_INSTALL_SCOPES = [
  'assessment-only',
  'mentor-also',
  'admin',
] as const

export interface PluginInstallMintInput {
  identity_type: PluginIdentityType
  install_id: string
  install_scope: PluginInstallScope
  label: string
}

/**
 * Validate + normalise a plugin-install mint request body. PURE.
 *
 * Requires purpose === 'plugin_install', a valid identity_type, a non-empty
 * install_id, and a valid install_scope. label defaults to install_id. Returns
 * the normalised input or a non-leaking error string (the route maps it to a
 * clean 400 before the DB CHECK constraints would otherwise reject the insert).
 */
export function validatePluginInstallMintInput(
  body: unknown,
): { ok: true; value: PluginInstallMintInput } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be valid JSON.' }
  }
  const b = body as Record<string, unknown>

  // purpose guard (mirrors the accreditation route's literal-purpose guard).
  if (b.purpose !== 'plugin_install') {
    return { ok: false, error: "purpose is required and must be 'plugin_install'." }
  }

  const identity_type = typeof b.identity_type === 'string' ? b.identity_type : ''
  if (!VALID_IDENTITY_TYPES.includes(identity_type as PluginIdentityType)) {
    return {
      ok: false,
      error: `identity_type is required and must be one of: ${VALID_IDENTITY_TYPES.join(', ')}`,
    }
  }

  const install_id = typeof b.install_id === 'string' ? b.install_id.trim() : ''
  if (!install_id) {
    return { ok: false, error: 'install_id is required.' }
  }

  const install_scope = typeof b.install_scope === 'string' ? b.install_scope : ''
  if (!VALID_INSTALL_SCOPES.includes(install_scope as PluginInstallScope)) {
    return {
      ok: false,
      error: `install_scope is required and must be one of: ${VALID_INSTALL_SCOPES.join(', ')}`,
    }
  }

  const label =
    typeof b.label === 'string' && b.label.trim().length > 0
      ? b.label.trim()
      : install_id

  return {
    ok: true,
    value: {
      identity_type: identity_type as PluginIdentityType,
      install_id,
      install_scope: install_scope as PluginInstallScope,
      label,
    },
  }
}
