import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, getAuthenticatedUser, corsHeaders } from '@/lib/security'
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
//   monthly_limit (optional, default 667) Override the monthly call cap
//   daily_limit   (optional, default 50)  Override the daily burst cap
//   max_chain_iterations (optional, default 20) Override iteration cap
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
      monthly_limit = 667,
      daily_limit = 50,
      max_chain_iterations = 20,
      notes,
    } = body

    if (!label || typeof label !== 'string' || label.trim().length === 0) {
      return NextResponse.json({ error: 'label is required' }, { status: 400 })
    }

    if (!['free', 'paid'].includes(tier)) {
      return NextResponse.json({ error: 'tier must be "free" or "paid"' }, { status: 400 })
    }

    // Generate the key
    const rawKey = generateApiKey()
    const key_hash = hashKey(rawKey)
    const key_prefix = keyPrefix(rawKey)

    const { data: keyRecord, error: insertErr } = await supabaseAdmin
      .from('api_keys')
      .insert({
        key_hash,
        key_prefix,
        label: label.trim(),
        owner_email: owner_email?.trim() || null,
        agent_id: agent_id?.trim() || null,
        tier,
        monthly_limit: Number(monthly_limit),
        daily_limit: Number(daily_limit),
        max_chain_iterations: Number(max_chain_iterations),
        is_active: true,
        notes: notes?.trim() || null,
      })
      .select('id, key_prefix, label, tier, monthly_limit, daily_limit, max_chain_iterations, owner_email, agent_id, is_active, created_at, notes')
      .single()

    if (insertErr || !keyRecord) {
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
