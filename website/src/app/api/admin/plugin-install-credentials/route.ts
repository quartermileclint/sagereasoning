/**
 * /api/admin/plugin-install-credentials — A10 per-install credential issuance + revocation.
 *
 * STATUS: NEW (2026-06-03, A10 Critical implementation — staging-plan session 12).
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/adr/2026-06-03-a10-token-format.md — Surface 1 (opaque bearer,
 *     DB-backed, instant revocation). Surface 2 (W3C-VC/AP2-mandate) deferred
 *     under PR7 and NOT built here.
 *   - /adopted/substrate-plugin-staging-plan.md §A10.
 *
 * WHAT THIS ROUTE IS
 *
 * The founder-only admin surface for minting and revoking A10 per-INSTALL
 * plugin-auth credentials (sr_inst_ tokens). It MIRRORS
 * /api/admin/accreditation-credentials (same requireAdmin / ADMIN_USER_ID gate,
 * same credential_audit pattern, same shown-once mint response). The
 * accreditation route is a SIBLING and is NOT modified by this session.
 *
 *   POST   — mint a new credential bound to (install_id, identity_type, scope).
 *            Returns the raw sr_inst_ token ONCE; the DB stores only its
 *            SHA-256 hash. A partial unique index (migration step 6b) rejects a
 *            second ACTIVE credential for the same install_id with a 409.
 *   DELETE — revoke a credential (is_active=false, revoked_at, suspended_reason).
 *            This is the universal revocation lever: the next /api/reason call
 *            presenting that token fails the is_active=true lookup filter in
 *            validatePluginInstallToken and is rejected.
 *
 * AUTH: founder-only via requireAdmin (reuses ADMIN_USER_ID — the same env var
 * /api/admin/accreditation-credentials uses).
 *
 * AUDIT: every successful mint/revoke writes a credential_audit row. The audit
 * table's agent_id column is NOT NULL; for plugin_install rows we store the
 * install_id there (the entity identifier for the audit row — design election
 * 2026-06-03) and record identity_type + install_scope + a 'plugin_install'
 * surface marker in details. On MINT, an audit-write failure compensates
 * (deletes the just-created credential) — auditless issuance is worse than
 * failed issuance. On REVOKE the credential stays disabled even if the audit
 * write fails (disabled is the fail-safe state); the request returns 500 noting
 * the audit gap.
 *
 * COMPLIANCE: R0 (issuance/revocation are load-bearing audit events) / R4 (no
 * engine internals in any response) / R17 (the admin check protects against
 * unauthorised issuance) / AC5 (R20a perimeter: NOT a distress surface; no R20a
 * interaction — assessed in the session decision-log entry) / AC7 (ENGAGED —
 * new auth surface; full Critical Change Protocol applied this session) / PR6
 * (ENGAGED — auth surface) / KG1 (every DB read/write awaited; no
 * fire-and-forget; the audit write is handled, not swallowed).
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAdmin,
  resolveProfileId,
  corsHeaders,
} from '@/lib/security'
import { generatePluginInstallToken } from '@/lib/plugin-install-auth'
import { validatePluginInstallMintInput } from './validation'

// Free-tier defaults for a freshly minted per-install credential (mirrors the
// accreditation route's A10_DEFAULTS shape).
const PLUGIN_INSTALL_DEFAULTS = {
  tier: 'free' as const,
  monthly_limit: 100,
  daily_limit: 100,
  max_chain_iterations: 1,
}

// =============================================================================
// POST — MINT a new per-install credential
//
// Body:
//   purpose        (required) must be the literal 'plugin_install'
//   identity_type  (required) 'human' | 'agent'
//   install_id     (required) the per-install identifier
//   install_scope  (required) 'assessment-only' | 'mentor-also' | 'admin'
//   label          (optional) human label; defaults to install_id
//
// Returns 201 with { credential, token, warning }. The token is shown ONCE.
// =============================================================================
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const { user, error: authError } = await requireAdmin(request)
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = validatePluginInstallMintInput(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { identity_type, install_id, install_scope, label } = parsed.value

  // Resolve the admin's auth.users.id → profiles.id so the owner_user_id FK is
  // satisfied (mirrors the accreditation route).
  const owner_user_id = await resolveProfileId(user.id)
  if (!owner_user_id) {
    return NextResponse.json(
      { error: 'No profile found for the authenticated admin user.' },
      { status: 500 },
    )
  }

  // Mint the token (raw shown once; only the hash is stored).
  const { raw, hash } = generatePluginInstallToken()
  const key_prefix = raw.slice(0, 14)

  const { data: credential, error: insertErr } = await supabaseAdmin
    .from('api_keys')
    .insert({
      key_hash: hash,
      key_prefix,
      label,
      owner_user_id,
      purpose: 'plugin_install',
      identity_type,
      install_id,
      install_scope,
      tier: PLUGIN_INSTALL_DEFAULTS.tier,
      monthly_limit: PLUGIN_INSTALL_DEFAULTS.monthly_limit,
      daily_limit: PLUGIN_INSTALL_DEFAULTS.daily_limit,
      max_chain_iterations: PLUGIN_INSTALL_DEFAULTS.max_chain_iterations,
      is_active: true,
    })
    .select('id, owner_user_id, label, identity_type, install_id, install_scope, tier, created_at')
    .single()

  if (insertErr || !credential) {
    // 23505 = unique_violation → an ACTIVE credential already exists for this
    // install_id (the partial unique index from migration step 6b).
    if (insertErr?.code === '23505') {
      return NextResponse.json(
        {
          error:
            'An active credential already exists for this install_id. ' +
            'Revoke the existing one before issuing a new one.',
        },
        { status: 409, headers: corsHeaders() },
      )
    }
    console.error('A10 plugin_install mint failed:', insertErr?.code || 'unknown')
    return NextResponse.json({ error: 'Failed to create credential.' }, { status: 500 })
  }

  // Audit the issuance. Fail closed: if the audit write fails, compensate by
  // deleting the just-created credential so we never have an unaudited live one.
  // agent_id carries the install_id (the audit table's agent_id is NOT NULL).
  const { error: auditErr } = await supabaseAdmin.from('credential_audit').insert({
    event_type: 'issue',
    credential_id: credential.id,
    actor_user_id: owner_user_id,
    agent_id: install_id,
    details: {
      surface: 'plugin_install',
      identity_type,
      install_scope,
      label,
      tier: PLUGIN_INSTALL_DEFAULTS.tier,
    },
  })

  if (auditErr) {
    await supabaseAdmin.from('api_keys').delete().eq('id', credential.id)
    console.error('A10 plugin_install audit-write failed; mint rolled back:', auditErr.code || 'unknown')
    return NextResponse.json(
      { error: 'Failed to record issuance audit; credential not created. Please retry.' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      credential,
      token: raw,
      warning:
        'This token is shown once. Store it securely. It cannot be retrieved ' +
        'later — only revoked and reissued.',
    },
    { status: 201, headers: corsHeaders() },
  )
}

// =============================================================================
// DELETE — REVOKE a per-install credential
//
// credential_id: from the ?id= query param (preferred) OR the JSON body
// { credential_id }. Optional body { reason }.
//
// Returns 200 { revoked: true, credential_id, revoked_at }.
// =============================================================================
export async function DELETE(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const { user, error: authError } = await requireAdmin(request)
  if (authError) return authError

  const idFromQuery = new URL(request.url).searchParams.get('id')
  let bodyCredentialId: string | null = null
  let reason: string | null = null
  try {
    const body = await request.json()
    if (body && typeof body === 'object') {
      if (typeof body.credential_id === 'string') bodyCredentialId = body.credential_id
      if (typeof body.reason === 'string') reason = body.reason
    }
  } catch {
    // No body is fine for DELETE; credential_id may come from the query param.
  }
  const credential_id = idFromQuery ?? bodyCredentialId

  if (!credential_id) {
    return NextResponse.json(
      { error: 'credential_id is required (pass ?id=<uuid> or { "credential_id": "<uuid>" }).' },
      { status: 400 },
    )
  }

  // Validate the credential exists, is a plugin_install row, and is active.
  const { data: existing, error: lookupErr } = await supabaseAdmin
    .from('api_keys')
    .select('id, install_id, identity_type, install_scope, is_active')
    .eq('id', credential_id)
    .eq('purpose', 'plugin_install')
    .maybeSingle()

  if (lookupErr) {
    console.error('A10 plugin_install revoke lookup failed:', lookupErr.code || 'unknown')
    return NextResponse.json({ error: 'Failed to look up credential.' }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json(
      { error: 'No plugin_install credential found with that id.' },
      { status: 404 },
    )
  }
  if (!existing.is_active) {
    return NextResponse.json(
      { error: 'Credential is already revoked.', credential_id },
      { status: 409 },
    )
  }

  const revoked_at = new Date().toISOString()
  const { error: updateErr } = await supabaseAdmin
    .from('api_keys')
    .update({
      is_active: false,
      revoked_at,
      suspended_reason: reason ?? 'admin_revocation',
    })
    .eq('id', credential_id)

  if (updateErr) {
    console.error('A10 plugin_install revoke failed:', updateErr.code || 'unknown')
    return NextResponse.json({ error: 'Failed to revoke credential.' }, { status: 500 })
  }

  // Audit the revocation. The credential is already disabled (the fail-safe
  // state), so an audit-write failure does NOT un-revoke — it returns 500
  // noting the audit gap; the credential remains safely revoked.
  const actor_user_id = await resolveProfileId(user.id)
  const { error: auditErr } = await supabaseAdmin.from('credential_audit').insert({
    event_type: 'revoke',
    credential_id,
    actor_user_id,
    agent_id: existing.install_id,
    details: {
      surface: 'plugin_install',
      reason: reason ?? 'admin_revocation',
      identity_type: existing.identity_type,
      install_scope: existing.install_scope,
    },
  })

  if (auditErr) {
    console.error('A10 plugin_install revoke audit-write failed (credential remains revoked):', auditErr.code || 'unknown')
    return NextResponse.json(
      {
        error:
          'Credential revoked, but recording the revocation audit failed. ' +
          'The credential is disabled. Please report this audit gap.',
        revoked: true,
        credential_id,
        revoked_at,
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { revoked: true, credential_id, revoked_at },
    { headers: corsHeaders() },
  )
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}
