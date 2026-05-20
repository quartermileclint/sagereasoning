/**
 * validation.ts — pure mint-input validation for the A10 credential admin
 * endpoint (2026-05-21). Factored out of route.ts (which may only export HTTP
 * handlers) so the validation logic is importable + unit-testable.
 *
 * Scope enum vocabularies are verbatim from
 * /website/src/lib/substrate/trust-layer/types/evaluation.ts — they give a clean
 * 400 before the DB CHECK constraints would otherwise reject the insert.
 */

export const VALID_IDENTITY_MODELS = [
  'delegated_user', 'service_account', 'vendor_framework',
  'api_key', 'browser_session', 'mcp_server', 'unknown',
] as const

export const VALID_PATH_POSTURES = [
  'endorsed', 'open_api', 'ambiguous', 'unsanctioned',
] as const

export interface MintInput {
  agent_id: string
  label: string
  scope_downstream_identity_model: string | null
  scope_path_posture: string | null
}

/**
 * Validate + normalise a mint request body. PURE.
 *
 * Requires a non-empty agent_id and purpose === 'atl_write'. label defaults to
 * agent_id. Scope params are optional; when present they must be members of the
 * respective enum. Returns the normalised MintInput or a non-leaking error.
 */
export function validateMintInput(
  body: unknown,
): { ok: true; value: MintInput } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be valid JSON.' }
  }
  const b = body as Record<string, unknown>

  const agent_id = typeof b.agent_id === 'string' ? b.agent_id.trim() : ''
  if (!agent_id) {
    return { ok: false, error: 'agent_id is required.' }
  }
  if (b.purpose !== 'atl_write') {
    return { ok: false, error: "purpose is required and must be 'atl_write'." }
  }

  const label =
    typeof b.label === 'string' && b.label.trim().length > 0
      ? b.label.trim()
      : agent_id

  const scope_downstream_identity_model =
    b.scope_downstream_identity_model == null
      ? null
      : String(b.scope_downstream_identity_model)
  const scope_path_posture =
    b.scope_path_posture == null ? null : String(b.scope_path_posture)

  if (
    scope_downstream_identity_model !== null &&
    !VALID_IDENTITY_MODELS.includes(scope_downstream_identity_model as (typeof VALID_IDENTITY_MODELS)[number])
  ) {
    return {
      ok: false,
      error: `scope_downstream_identity_model must be one of: ${VALID_IDENTITY_MODELS.join(', ')}`,
    }
  }
  if (
    scope_path_posture !== null &&
    !VALID_PATH_POSTURES.includes(scope_path_posture as (typeof VALID_PATH_POSTURES)[number])
  ) {
    return {
      ok: false,
      error: `scope_path_posture must be one of: ${VALID_PATH_POSTURES.join(', ')}`,
    }
  }

  return {
    ok: true,
    value: { agent_id, label, scope_downstream_identity_model, scope_path_posture },
  }
}
