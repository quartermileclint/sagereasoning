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
    // 2026-05-09 fix (sub-item ii): user_id -> owner_user_id per api/api-keys-schema.sql
    // line 27. Same-domain pre-existing bug as the /api/keys fix on 2026-05-08.
    let keysQuery = supabaseAdmin
      .from('api_keys')
      .select('id, label, tier, monthly_limit')
      .eq('owner_user_id', auth.user.id)

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

    // Get usage data for the month.
    // 2026-05-09 fix (sub-item ii expanded scope): the api_key_usage SELECT was
    // referencing columns that do not exist on the deployed schema. Per
    // api/api-keys-schema.sql lines 63-87, the actual columns are:
    //   total_calls, guardrail_calls, score_iterate_calls, agent_baseline_calls,
    //   other_calls, current_day, daily_calls.
    // Old code referenced: endpoint, day, daily_total — none of which exist.
    // Per (api_key_id, year, month) the schema stores AT MOST ONE ROW (UNIQUE
    // constraint, line 87). Per-endpoint stored as separate counter columns.
    // Daily trend cannot be reconstructed from this schema (only the current
    // day's count is tracked); that field has been dropped from the response in
    // favour of a single daily_calls_today value.
    const keyIds = keys.map(k => k.id)

    const { data: usageRows, error: usageError } = await supabaseAdmin
      .from('api_key_usage')
      .select('api_key_id, total_calls, guardrail_calls, score_iterate_calls, agent_baseline_calls, other_calls, current_day, daily_calls')
      .in('api_key_id', keyIds)
      .eq('year', year)
      .eq('month', month)

    if (usageError) {
      console.error('Usage query error:', usageError)
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
    }

    // Aggregate by key — at most one row per (api_key_id, year, month).
    const todayDay = now.getUTCDate()

    const keyUsage = keys.map(key => {
      const row = (usageRows || []).find(r => r.api_key_id === key.id)
      const totalCalls = row?.total_calls ?? 0

      // Per-endpoint counts read directly from schema columns.
      const byEndpoint: Record<string, number> = {
        guardrail: row?.guardrail_calls ?? 0,
        score_iterate: row?.score_iterate_calls ?? 0,
        agent_baseline: row?.agent_baseline_calls ?? 0,
        other: row?.other_calls ?? 0,
      }

      // daily_calls is meaningful only when current_day matches today.
      // If the row's current_day is older than today, the counter has not yet
      // been reset by an incoming call; treat as 0 for "today's calls".
      const dailyCallsToday = (row?.current_day === todayDay)
        ? (row.daily_calls ?? 0)
        : 0

      return {
        key_id: key.id,
        label: key.label,
        tier: key.tier,
        total_calls: totalCalls,
        monthly_limit: key.monthly_limit,
        monthly_remaining: Math.max(0, key.monthly_limit - totalCalls),
        by_endpoint: byEndpoint,
        daily_calls_today: dailyCallsToday,
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
