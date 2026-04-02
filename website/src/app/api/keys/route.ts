import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'node:crypto'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/keys — List the authenticated user's API keys
 *
 * Returns key metadata (label, tier, usage, created_at) but NOT the raw key.
 * The raw key is only shown once at creation time.
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { data: keys, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, label, tier, is_active, suspended_reason, monthly_limit, daily_limit, max_chain_iterations, created_at')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }

    // Get current month's usage for each key
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = now.getUTCMonth() + 1

    const keysWithUsage = await Promise.all(
      (keys || []).map(async (key) => {
        const { data: usage } = await supabaseAdmin
          .from('api_key_usage')
          .select('monthly_total, daily_total')
          .eq('api_key_id', key.id)
          .eq('year', year)
          .eq('month', month)
          .eq('day', now.getUTCDate())
          .single()

        return {
          ...key,
          usage: {
            monthly_calls: usage?.monthly_total || 0,
            monthly_limit: key.monthly_limit,
            monthly_remaining: key.monthly_limit - (usage?.monthly_total || 0),
            daily_calls: usage?.daily_total || 0,
            daily_limit: key.daily_limit,
          },
        }
      })
    )

    return NextResponse.json({
      keys: keysWithUsage,
      count: keysWithUsage.length,
    }, { headers: corsHeaders() })
  } catch (error) {
    console.error('Keys API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/keys — Generate a new API key
 *
 * Creates a free-tier API key. The raw key is returned ONCE in the response.
 * Only the SHA-256 hash is stored in the database.
 *
 * Body: { label: string }
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { label } = await request.json()

    if (!label || typeof label !== 'string' || label.trim().length === 0) {
      return NextResponse.json({ error: 'label is required (e.g., "My App", "Development")' }, { status: 400 })
    }

    if (label.length > 100) {
      return NextResponse.json({ error: 'label must be 100 characters or fewer' }, { status: 400 })
    }

    // Check key limit (max 5 keys per user on free tier)
    const { count } = await supabaseAdmin
      .from('api_keys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .eq('is_active', true)

    if ((count || 0) >= 5) {
      return NextResponse.json({
        error: 'Maximum 5 active API keys per account. Revoke an existing key to create a new one.',
      }, { status: 400 })
    }

    // Generate the key
    const rawKey = `sr_live_${randomBytes(16).toString('hex')}`
    const keyHash = createHash('sha256').update(rawKey).digest('hex')

    // Store only the hash
    const { data: newKey, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: auth.user.id,
        key_hash: keyHash,
        label: label.trim(),
        tier: 'free',
        is_active: true,
        monthly_limit: 100,
        daily_limit: 100, // No daily cap for free tier (rate limiting handles burst)
        max_chain_iterations: 1,
      })
      .select('id, label, tier, monthly_limit, daily_limit, max_chain_iterations, created_at')
      .single()

    if (error || !newKey) {
      console.error('Error creating API key:', error)
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    return NextResponse.json({
      key: rawKey,
      warning: 'Save this key now. It will not be shown again.',
      id: newKey.id,
      label: newKey.label,
      tier: newKey.tier,
      monthly_limit: newKey.monthly_limit,
      created_at: newKey.created_at,
      usage_example: {
        header: `Authorization: Bearer ${rawKey}`,
        alternative: `X-Api-Key: ${rawKey}`,
      },
    }, { status: 201, headers: corsHeaders() })
  } catch (error) {
    console.error('Key creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/keys — Revoke an API key
 *
 * Body: { key_id: string }
 */
export async function DELETE(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { key_id } = await request.json()

    if (!key_id || typeof key_id !== 'string') {
      return NextResponse.json({ error: 'key_id is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: key } = await supabaseAdmin
      .from('api_keys')
      .select('id, user_id')
      .eq('id', key_id)
      .eq('user_id', auth.user.id)
      .single()

    if (!key) {
      return NextResponse.json({ error: 'API key not found or not owned by you' }, { status: 404 })
    }

    // Soft-delete (deactivate)
    await supabaseAdmin
      .from('api_keys')
      .update({
        is_active: false,
        suspended_reason: 'Revoked by user',
      })
      .eq('id', key_id)

    return NextResponse.json({ revoked: true, key_id }, { headers: corsHeaders() })
  } catch (error) {
    console.error('Key revocation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
