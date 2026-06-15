import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, getAuthenticatedUser, corsHeaders } from '@/lib/security'
import { API_KEY_FREE_TIER_DEFAULTS } from '@/lib/api-key-defaults'
import {
  PRACTICE_CAPABILITIES,
  UNIFIED_PRACTICE_CREDENTIAL_PREFIX,
  capabilitiesIncludeWriteClass,
} from '@/lib/practice-credential'
import { randomBytes, createHash } from 'node:crypto'

// Admin user ID — only this user can manage API keys
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

// =============================================================================
// HELPERS
// =============================================================================

/** Generate a new API key in format sr_live_<32 hex chars> */
function generateApiKey(): string {
  return `sr_live_${randomBytes(16).toString('hex')}`
}

/** SHA-256 hash of the raw key */
function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}

/** First 14 chars of the raw key for display (e.g. "sr_live_a1b2c3") */
function keyPrefix(rawKey: string): string {
  return rawKey.slice(0, 14)
}

/** Authenticate and verify admin access */
async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || !ADMIN_USER_ID || user.id !== ADMIN_USER_ID) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
    }
  }
  return { user, error: null }
}

// =============================================================================
// GET /api/admin/api-keys
// List all API keys with current-month usage summary
// =============================================================================

export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    // Pull from the convenience view (current month usage + key metadata)
    const { data: keys, error } = await supabaseAdmin
      .from('api_key_usage_current')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch API keys:', error)
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }

    return NextResponse.json(
      {
        count: keys?.length ?? 0,
        keys: keys ?? [],
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('API key list error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// POST /api/admin/api-keys
// Issue a new API key
//
// Body:
//   label         (required) Human name e.g. "My Agent v1", "Beta Tester — Alice"
//   owner_email   (optional) Contact email for quota warnings
//   agent_id      (optional) Agent identifier (self-reported by the integrator)
//   tier          (optional, default "free") "free" | "paid"
//   monthly_limit (optional, default 30) Override the monthly call cap
//   daily_limit   (optional, default 1)  Override the daily burst cap
//   max_chain_iterations (optional, default 1) Override iteration cap
//
//   Limit defaults come from API_KEY_FREE_TIER_DEFAULTS (adopted 30/1/1,
//   matched to api-keys-schema.sql — CI-6 mint-defaults drift fix, FX-12).
//   notes         (optional) Internal notes (e.g. "Granted for beta testing")
//
// Returns:
//   api_key  — the raw key (shown ONCE — store it immediately)
//   prefix   — first 14 chars for display
//   id       — UUID of the key record
//   ...all other key fields
// =============================================================================

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const {
      label,
      owner_email,
      agent_id,
      tier = 'free',
      monthly_limit = API_KEY_FREE_TIER_DEFAULTS.monthly_limit,
      daily_limit = API_KEY_FREE_TIER_DEFAULTS.daily_limit,
      max_chain_iterations = API_KEY_FREE_TIER_DEFAULTS.max_chain_iterations,
      notes,
      capabilities, // CI-14 (optional): presence triggers UPC mode (sr_prac_)
      owner_kind, // CI-14 (optional): 'operator' | 'external_consumer'
    } = body

    if (!label || typeof label !== 'string' || label.trim().length === 0) {
      return NextResponse.json({ error: 'label is required' }, { status: 400 })
    }

    if (!['free', 'paid'].includes(tier)) {
      return NextResponse.json({ error: 'tier must be "free" or "paid"' }, { status: 400 })
    }

    // CI-14 UPC mode: when `capabilities` is supplied, mint a Unified Practice
    // Credential (sr_prac_, purpose='unified_practice', explicit capabilities[],
    // owner_kind, credential_provenance). ADDITIVE — when `capabilities` is omitted
    // the mint below is byte-identical to the legacy sr_live_ ecosystem path.
    const upcMode = capabilities !== undefined
    let rawKey: string
    let insertObj: Record<string, unknown>

    if (upcMode) {
      const allowed = PRACTICE_CAPABILITIES as readonly string[]
      const bad =
        Array.isArray(capabilities) &&
        capabilities.filter((c: unknown) => typeof c !== 'string' || !allowed.includes(c))
      if (!Array.isArray(capabilities) || capabilities.length === 0 || (bad && bad.length > 0)) {
        return NextResponse.json(
          {
            error: `capabilities must be a non-empty subset of ${JSON.stringify(PRACTICE_CAPABILITIES)}`,
          },
          { status: 400 },
        )
      }
      if (owner_kind !== undefined && !['operator', 'external_consumer'].includes(owner_kind)) {
        return NextResponse.json(
          { error: "owner_kind must be 'operator' or 'external_consumer'" },
          { status: 400 },
        )
      }

      // Resolve the operator owner from owner_email — EXACT single match only (R3:
      // never mis-promote; 0 or ≥2 matches ⇒ external_consumer, owner_user_id null).
      let resolvedOwnerId: string | null = null
      let resolvedOwnerKind: 'operator' | 'external_consumer' =
        owner_kind === 'external_consumer' ? 'external_consumer' : 'operator'

      if (resolvedOwnerKind === 'operator') {
        const email = owner_email?.trim()
        if (email) {
          const { data: matches } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .ilike('email', email)
          const uniqueIds = Array.from(
            new Set((matches ?? []).map((m: { id: string }) => m.id)),
          )
          if (uniqueIds.length === 1) {
            resolvedOwnerId = uniqueIds[0]
          } else {
            resolvedOwnerKind = 'external_consumer' // 0 or ≥2 — cannot promote
          }
        } else {
          resolvedOwnerKind = 'external_consumer'
        }
      }

      // CI-14 Step-7 honesty fix: a UPC carrying a WRITE-CLASS capability
      // (accreditation_write/calling/reflect) requires owner+agent — the validator
      // binds agent_id for all three and the 6e-broadened
      // api_keys_sage_assent_write_requires_owner_and_agent CHECK enforces it at the DB.
      // Pre-validate here so the caller gets a clear 400 instead of an opaque insert
      // 500 once 6e §A is applied. (Consult-only / l1_supply UPCs are unaffected.)
      // The write-class set is the single source `capabilitiesIncludeWriteClass`, kept
      // aligned with the 6e DB CHECK (practice-credential.ts).
      const trimmedAgentId = agent_id?.trim() || null
      const wantsWriteClass = capabilitiesIncludeWriteClass(capabilities as string[])
      if (wantsWriteClass && (resolvedOwnerId === null || trimmedAgentId === null)) {
        return NextResponse.json(
          {
            error:
              'A UPC carrying a write-class capability (accreditation_write, calling, ' +
              'or reflect) requires both a resolvable owner (owner_email matching exactly ' +
              'one profile) and a non-empty agent_id.',
          },
          { status: 400 },
        )
      }

      rawKey = `${UNIFIED_PRACTICE_CREDENTIAL_PREFIX}${randomBytes(16).toString('hex')}`
      insertObj = {
        key_hash: hashKey(rawKey),
        key_prefix: keyPrefix(rawKey),
        label: label.trim(),
        owner_email: owner_email?.trim() || null,
        agent_id: trimmedAgentId,
        owner_user_id: resolvedOwnerId,
        owner_kind: resolvedOwnerKind,
        purpose: 'unified_practice',
        capabilities,
        credential_provenance: { minted_by: 'admin/api-keys', basis: 'admin_issued_upc' },
        tier,
        monthly_limit: Number(monthly_limit),
        daily_limit: Number(daily_limit),
        max_chain_iterations: Number(max_chain_iterations),
        is_active: true,
        notes: notes?.trim() || null,
      }
    } else {
      // Legacy sr_live_ ecosystem mint. CI-14 Step-7 honesty fix: set owner_kind
      // explicitly to 'external_consumer' (the honest default — the admin ecosystem
      // mint never resolves owner_user_id, so the row IS a third-party consumer; this
      // matches the Step-2 backfill classification "null owner ⇒ external_consumer").
      // Without this the row would inherit the column DEFAULT 'operator' while carrying
      // a null owner — contradicting the declared owner_kind invariant and leaving the
      // row un-erasable-on-request by BOTH the user-JWT path (no profiles FK) and the
      // Step-7 token path (had it keyed on owner_kind). Auth-path-neutral: owner_kind is
      // never read at validation time (zero refs in practice-credential.ts).
      rawKey = generateApiKey()
      insertObj = {
        key_hash: hashKey(rawKey),
        key_prefix: keyPrefix(rawKey),
        label: label.trim(),
        owner_email: owner_email?.trim() || null,
        agent_id: agent_id?.trim() || null,
        owner_kind: 'external_consumer',
        tier,
        monthly_limit: Number(monthly_limit),
        daily_limit: Number(daily_limit),
        max_chain_iterations: Number(max_chain_iterations),
        is_active: true,
        notes: notes?.trim() || null,
      }
    }

    const { data: keyRecord, error: insertErr } = await supabaseAdmin
      .from('api_keys')
      .insert(insertObj)
      .select('id, key_prefix, label, tier, monthly_limit, daily_limit, max_chain_iterations, owner_email, agent_id, is_active, created_at, notes')
      .single()

    if (insertErr || !keyRecord) {
      // CI-14 Step-7: a 23514 check_violation here is almost always the 6e-broadened
      // owner+agent invariant on a write-class UPC (the pre-validation above should
      // catch it first; this is the belt for any other constraint path). Surface a
      // clear 400 instead of an opaque 500.
      if ((insertErr as { code?: string } | null)?.code === '23514') {
        return NextResponse.json(
          {
            error:
              'The credential violates a database invariant (e.g. a write-class UPC ' +
              'without owner+agent). Check capabilities, owner_email, and agent_id.',
            detail: insertErr?.message,
          },
          { status: 400 },
        )
      }
      console.error('Failed to create API key:', insertErr)
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    // Return the raw key ONCE — it cannot be retrieved again
    return NextResponse.json(
      {
        message: 'API key created successfully. The api_key field is shown once only — store it immediately.',
        api_key: rawKey,
        ...keyRecord,
      },
      {
        status: 201,
        headers: corsHeaders(),
      }
    )
  } catch (err) {
    console.error('API key create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// PATCH /api/admin/api-keys
// Update a key (activate/suspend, change limits)
//
// Body:
//   id               (required) UUID of the key to update
//   is_active        (optional) true | false
//   suspended_reason (optional) Reason string (populated when suspending)
//   monthly_limit    (optional) New monthly cap
//   daily_limit      (optional) New daily cap
//   max_chain_iterations (optional) New iteration cap
//   tier             (optional) "free" | "paid"
//   notes            (optional) Internal notes
// =============================================================================

export async function PATCH(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, is_active, suspended_reason, monthly_limit, daily_limit, max_chain_iterations, tier, notes } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Build update payload (only include fields provided)
    const updates: Record<string, unknown> = {}
    if (is_active !== undefined) updates.is_active = Boolean(is_active)
    if (suspended_reason !== undefined) updates.suspended_reason = suspended_reason || null
    if (monthly_limit !== undefined) updates.monthly_limit = Number(monthly_limit)
    if (daily_limit !== undefined) updates.daily_limit = Number(daily_limit)
    if (max_chain_iterations !== undefined) updates.max_chain_iterations = Number(max_chain_iterations)
    if (tier !== undefined) {
      if (!['free', 'paid'].includes(tier)) {
        return NextResponse.json({ error: 'tier must be "free" or "paid"' }, { status: 400 })
      }
      updates.tier = tier
    }
    if (notes !== undefined) updates.notes = notes || null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .select('id, key_prefix, label, tier, monthly_limit, daily_limit, max_chain_iterations, is_active, suspended_reason, owner_email, notes')
      .single()

    if (updateErr || !updated) {
      console.error('Failed to update API key:', updateErr)
      return NextResponse.json({ error: 'Failed to update API key or key not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'API key updated successfully', key: updated },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('API key update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}
