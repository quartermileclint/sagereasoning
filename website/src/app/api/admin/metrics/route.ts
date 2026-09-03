import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, getAuthenticatedUser } from '@/lib/security'
import { pagedRows } from '@/lib/db/paged-select'

// Admin user ID — only this user can access metrics
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  // Verify admin access via proper JWT authentication
  const user = await getAuthenticatedUser(request)
  if (!user || !ADMIN_USER_ID || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    // Get all metrics in parallel
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // H10/H11, row-cap sweep 2026-09-02/-03: `analytics_events` has no
    // CREATE TABLE in this repo, so its primary-key column name could not be
    // confirmed from source — `created_at` is used alone as the pagination
    // cursor (see paged-select.ts's header for the documented, disclosed
    // residual tie-risk at this table's low write rate; a bounded miss at
    // one page boundary, never a systemic truncation).
    //
    // H10 (CONFIRMED live 2026-09-03: `get_event_counts` does not exist in
    // production, so this fallback runs on EVERY request): was an unbounded
    // whole-table read. H11 (752/1,000 rows in the trailing 7 days as of
    // 2026-09-03, confirmed near-term): the week/today windows were
    // filtered but never paged, so a window itself could still silently
    // truncate once it crossed the cap.
    const [
      // Total counts by event type
      totalEvents,
      // Events in last 7 days
      weekEventsResult,
      // Today's events
      todayEventsResult,
      // Recent events with details
      recentEvents,
      // Total registered users
      totalUsers,
      // Total actions scored
      totalScores,
    ] = await Promise.all([
      // All-time counts by type
      supabaseAdmin.rpc('get_event_counts'),
      // Week counts by type — paged
      pagedRows<{ event_type: string }>(supabaseAdmin, 'analytics_events', 'created_at', 'event_type,created_at', {
        gteColumn: 'created_at',
        gteValue: weekAgo,
      }),
      // Today counts — paged
      pagedRows<{ event_type: string }>(supabaseAdmin, 'analytics_events', 'created_at', 'event_type,created_at', {
        gteColumn: 'created_at',
        gteValue: today,
      }),
      // Recent 50 events
      supabaseAdmin.from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
      // Total auth users (from profiles table)
      supabaseAdmin.from('profiles')
        .select('id', { count: 'exact', head: true }),
      // Total action scores
      supabaseAdmin.from('action_scores')
        .select('id', { count: 'exact', head: true }),
    ])

    // Aggregate week events by type
    const weekCounts: Record<string, number> = {}
    if (weekEventsResult.error) {
      return NextResponse.json({ error: `Failed to read week events: ${weekEventsResult.error}` }, { status: 500 })
    }
    for (const e of weekEventsResult.rows ?? []) {
      weekCounts[e.event_type] = (weekCounts[e.event_type] || 0) + 1
    }

    // Aggregate today events by type
    const todayCounts: Record<string, number> = {}
    if (todayEventsResult.error) {
      return NextResponse.json({ error: `Failed to read today's events: ${todayEventsResult.error}` }, { status: 500 })
    }
    for (const e of todayEventsResult.rows ?? []) {
      todayCounts[e.event_type] = (todayCounts[e.event_type] || 0) + 1
    }

    // Aggregate all-time events by type (fallback if RPC doesn't exist)
    let allTimeCounts: Record<string, number> = {}
    if (totalEvents.error) {
      // RPC does not exist in production (confirmed 2026-09-03) — this
      // fallback is the live path on every request. Fully paged.
      const { rows: allEvents, error: allEventsErr } = await pagedRows<{ event_type: string }>(
        supabaseAdmin,
        'analytics_events',
        'created_at',
        'event_type,created_at'
      )
      if (allEventsErr) {
        return NextResponse.json({ error: `Failed to read all-time events: ${allEventsErr}` }, { status: 500 })
      }
      for (const e of allEvents ?? []) {
        allTimeCounts[e.event_type] = (allTimeCounts[e.event_type] || 0) + 1
      }
    } else if (totalEvents.data) {
      for (const row of totalEvents.data) {
        allTimeCounts[row.event_type] = row.count
      }
    }

    return NextResponse.json({
      summary: {
        total_registered_users: totalUsers.count || 0,
        total_actions_scored: totalScores.count || 0,
        all_time: allTimeCounts,
        last_7_days: weekCounts,
        today: todayCounts,
      },
      recent_events: recentEvents.data || [],
    })
  } catch (error) {
    console.error('Admin metrics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
