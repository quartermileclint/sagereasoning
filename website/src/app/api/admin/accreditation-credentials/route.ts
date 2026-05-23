/**
 * /api/admin/accreditation-credentials — A10 credential issuance + revocation.
 *
 * STATUS: NEW (2026-05-21, A10 build — D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21).
 *
 * GOVERNING DOCUMENT:
 *   - /adopted/sage-assent-a10-design.md — Decision D (issuance flow + surface),
 *     Decision B (per-owner binding), Decision F (revocation), Decision H
 *     (audit trail), Decision 3a (optional per-credential scope params).
 *     Adopted under D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17.
 *
 * WHAT THIS ROUTE IS
 *
 * The founder-only admin surface for minting and revoking A10 per-agent write
 * credentials (sr_assent_ tokens). Mirrors the existing /api/admin/api-keys
 * pattern (Decision D option (b)). NOT on the R20a perimeter (AC5 not engaged;
 * no distress surface).
 *
 *   POST   — mint a new credential bound to (owner_profile, agent_id). Returns
 *            the raw token ONCE; the DB stores only its SHA-256 hash.
 *   DELETE — revoke a credential (is_active=false, revoked_at, suspended_reason).
 *
 * AUTH: founder-only via requireAdmin (reuses ADMIN_USER_ID per the build's
 * Step 1 election — same env var /api/admin/api-keys uses).
 *
 * AUDIT (Decision H): every successful mint/revoke writes a credential_audit
 * row in the same transaction-shaped flow as the api_keys mutation. If the
 * audit write fails on MINT, the credential insert is compensated (deleted) and
 * the request fails — auditless issuance is worse than failed issuance. On
 * REVOKE the credential stays disabled even if the audit write fails (disabled
 * is the fail-safe state); the request returns 500 noting the audit gap.
 *
 * COMPLIANCE: R0 (issuance/revocation are load-bearing audit events) / R3 (the
 * mint response carries an explicit "shown once" warning) / R4 (no engine
 * internals in any response) / R17 (the admin check protects against
 * unauthorised issuance — primary R17 engagement) / AC5 (NOT engaged) / AC7
 * (ENGAGED — new auth surface; full Critical Change Protocol applied at this
 * build) / KG1 (every DB read/write awaited; no fire-and-forget; the audit
 * write throws on error and is handled). PR6 NOT engaged.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAdmin,
  generateSageAssentWriteToken,
  resolveProfileId,
  corsHeaders,
} from '@/lib/security'
import { validateMintInput } from './validation'

// Free-tier defaults for a freshly minted A10 credential (mirrors the existing
// free-tier shape in /api/api-keys-schema.sql + validateApiKey).
const A10_DEFAULTS = {
  tier: 'free' as const,
  monthly_limit: 100,
  daily_limit: 100,
  max_chain_iterations: 1,
}

// =============================================================================
// POST — MINT a new A10 write credential
//
// Body:
//   agent_id                        (required) the agent the credential authorises
//   purpose                         (required) must be the literal 'sage_assent_write'
//   label                           (optional) human label; defaults to agent_id
//   scope_downstream_identity_model (optional) per-credential scope (Decision 3a)
//   scope_path_posture              (optional) per-credential scope (Decision 3a)
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

  const parsed = validateMintInput(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { agent_id, label, scope_downstream_identity_model, scope_path_posture } = parsed.value

  // Resolve the admin's auth.users.id → profiles.id (Decision D step 3). This
  // confirms the profile exists so the owner_user_id FK won't be violated.
  const owner_user_id = await resolveProfileId(user.id)
  if (!owner_user_id) {
    return NextResponse.json(
      { error: 'No profile found for the authenticated admin user.' },
      { status: 500 },
    )
  }

  // Mint the token (raw shown once; only the hash is stored).
  const { raw, hash } = generateSageAssentWriteToken()
  const key_prefix = raw.slice(0, 14)

  const { data: credential, error: insertErr } = await supabaseAdmin
    .from('api_keys')
    .insert({
      key_hash: hash,
      key_prefix,
      label,
      agent_id,
      owner_user_id,
      purpose: 'sage_assent_write',
      tier: A10_DEFAULTS.tier,
      monthly_limit: A10_DEFAULTS.monthly_limit,
      daily_limit: A10_DEFAULTS.daily_limit,
      max_chain_iterations: A10_DEFAULTS.max_chain_iterations,
      is_active: true,
      scope_downstream_identity_model,
      scope_path_posture,
    })
    .select(
      'id, agent_id, owner_user_id, label, tier, scope_downstream_identity_model, scope_path_posture, created_at',
    )
    .single()

  if (insertErr || !credential) {
    // 23505 = unique_violation → a credential already exists for this
    // (owner, agent_id) tuple (the partial unique index).
    if (insertErr?.code === '23505') {
      return NextResponse.json(
        {
          error: 'A credential already exists for this owner and agent_id. ' +
            'Revoke the existing one before issuing a new one.',
        },
        { status: 409, headers: corsHeaders() },
      )
    }
    console.error('A10 credential mint failed:', insertErr?.code || 'unknown')
    return NextResponse.json({ error: 'Failed to create credential.' }, { status: 500 })
  }

  // Audit the issuance (Decision H). Fail closed: if the audit write fails,
  // compensate by deleting the just-created credential so we never have an
  // unaudited live credential.
  const { error: auditErr } = await supabaseAdmin.from('credential_audit').insert({
    event_type: 'issue',
    credential_id: credential.id,
    actor_user_id: owner_user_id,
    agent_id,
    details: {
      label,
      tier: A10_DEFAULTS.tier,
      scope_downstream_identity_model,
      scope_path_posture,
    },
  })

  if (auditErr) {
    await supabaseAdmin.from('api_keys').delete().eq('id', credential.id)
    console.error('A10 credential audit-write failed; mint rolled back:', auditErr.code || 'unknown')
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
// DELETE — REVOKE an A10 write credential (Decision F)
//
// credential_id: from the ?id= query param (preferred for DELETE) OR the JSON
// body { credential_id }. Optional body { reason }.
//
// Returns 200 { revoked: true, credential_id, revoked_at }.
// =============================================================================
export async function DELETE(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const { user, error: authError } = await requireAdmin(request)
  if (authError) return authError

  // credential_id from query param (preferred) or body; reason from body.
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

  // Validate the credential exists, is an sage_assent_write row, and is active.
  const { data: existing, error: lookupErr } = await supabaseAdmin
    .from('api_keys')
    .select('id, agent_id, is_active, scope_downstream_identity_model, scope_path_posture')
    .eq('id', credential_id)
    .eq('purpose', 'sage_assent_write')
    .maybeSingle()

  if (lookupErr) {
    console.error('A10 credential revoke lookup failed:', lookupErr.code || 'unknown')
    return NextResponse.json({ error: 'Failed to look up credential.' }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json(
      { error: 'No sage_assent_write credential found with that id.' },
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
    console.error('A10 credential revoke failed:', updateErr.code || 'unknown')
    return NextResponse.json({ error: 'Failed to revoke credential.' }, { status: 500 })
  }

  // Audit the revocation (Decision H). The credential is already disabled (the
  // fail-safe state), so an audit-write failure does NOT un-revoke — it returns
  // 500 noting the audit gap; the credential remains safely revoked.
  const actor_user_id = await resolveProfileId(user.id)
  const { error: auditErr } = await supabaseAdmin.from('credential_audit').insert({
    event_type: 'revoke',
    credential_id,
    actor_user_id,
    agent_id: existing.agent_id,
    details: {
      reason: reason ?? 'admin_revocation',
      scope_downstream_identity_model: existing.scope_downstream_identity_model,
      scope_path_posture: existing.scope_path_posture,
    },
  })

  if (auditErr) {
    console.error('A10 revoke audit-write failed (credential remains revoked):', auditErr.code || 'unknown')
    return NextResponse.json(
      {
        error: 'Credential revoked, but recording the revocation audit failed. ' +
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
