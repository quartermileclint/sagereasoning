import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/usage — Usage summary for the authenticated user
 *
 * Returns monthly usage breakdown by endpoint, daily trends, and
 * remaining allowance across all API keys.
 *
 * Query params:
 *   ?month=YYYY-MM (default: current month)
 *   ?key_id=<uuid> (optional: filter to a specific key)
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const url = new URL(request.url)
    const monthParam = url.searchParams.get('month')
    const keyIdParam = url.searchParams.get('key_id')

    const now = new Date()
    let year: number, month: number

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number)
      year = y
      month = m
    } else {
      year = now.getUTCFullYear()
      month = now.getUTCMonth() + 1
    }

    // Get user's API keys
    let keysQuery = supabaseAdmin
      .from('api_keys')
      .select('id, label, tier, monthly_limit')
      .eq('user_id', auth.user.id)

    if (keyIdParam) {
      keysQuery = keysQuery.eq('id', keyIdParam)
    }

    const { data: keys, error: keysError } = await keysQuery

    if (keysError || !keys || keys.length === 0) {
      return NextResponse.json({
        month: `${year}-${String(month).padStart(2, '0')}`,
        total_calls: 0,
        keys: [],
        by_endpoint: {},
        message: 'No API keys found. Create one at POST /api/keys.',
      }, { headers: corsHeaders() })
    }

    // Get usage data for the month
    const keyIds = keys.map(k => k.id)

    const { data: usageRows, error: usageError } = await supabaseAdmin
      .from('api_key_usage')
      .select('api_key_id, endpoint, day, daily_total')
      .in('api_key_id', keyIds)
      .eq('year', year)
      .eq('month', month)
      .order('day', { ascending: true })

    if (usageError) {
      console.error('Usage query error:', usageError)
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
    }

    // Aggregate by key
    const keyUsage = keys.map(key => {
      const keyRows = (usageRows || []).filter(r => r.api_key_id === key.id)
      const totalCalls = keyRows.reduce((sum, r) => sum + (r.daily_total || 0), 0)

      // By endpoint
      const byEndpoint: Record<string, number> = {}
      keyRows.forEach(r => {
        if (r.endpoint) {
          byEndpoint[r.endpoint] = (byEndpoint[r.endpoint] || 0) + (r.daily_total || 0)
        }
      })

      // Daily trend
      const dailyTrend: Record<number, number> = {}
      keyRows.forEach(r => {
        dailyTrend[r.day] = (dailyTrend[r.day] || 0) + (r.daily_total || 0)
      })

      return {
        key_id: key.id,
        label: key.label,
        tier: key.tier,
        total_calls: totalCalls,
        monthly_limit: key.monthly_limit,
        monthly_remaining: Math.max(0, key.monthly_limit - totalCalls),
        by_endpoint: byEndpoint,
        daily_trend: dailyTrend,
      }
    })

    const totalCalls = keyUsage.reduce((sum, k) => sum + k.total_calls, 0)

    // Aggregate by endpoint across all keys
    const globalByEndpoint: Record<string, number> = {}
    keyUsage.forEach(k => {
      Object.entries(k.by_endpoint).forEach(([endpoint, count]) => {
        globalByEndpoint[endpoint] = (globalByEndpoint[endpoint] || 0) + count
      })
    })

    return NextResponse.json({
      month: `${year}-${String(month).padStart(2, '0')}`,
      total_calls: totalCalls,
      keys: keyUsage,
      by_endpoint: globalByEndpoint,
    }, { headers: corsHeaders() })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
