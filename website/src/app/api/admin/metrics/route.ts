import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Admin user ID — only this user can access metrics
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

export async function GET(request: NextRequest) {
  // Verify admin access via auth header
  const authHeader = request.headers.get('x-user-id')
  if (!ADMIN_USER_ID || authHeader !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    // Get all metrics in parallel
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      // Total counts by event type
      totalEvents,
      // Events in last 7 days
      weekEvents,
      // Today's events
      todayEvents,
      // Recent events with details
      recentEvents,
      // Total registered users
      totalUsers,
      // Total actions scored
      totalScores,
    ] = await Promise.all([
      // All-time counts by type
      supabaseAdmin.rpc('get_event_counts'),
      // Week counts by type
      supabaseAdmin.from('analytics_events')
        .select('event_type')
        .gte('created_at', weekAgo),
      // Today counts
      supabaseAdmin.from('analytics_events')
        .select('event_type')
        .gte('created_at', today),
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
    if (weekEvents.data) {
      for (const e of weekEvents.data) {
        weekCounts[e.event_type] = (weekCounts[e.event_type] || 0) + 1
      }
    }

    // Aggregate today events by type
    const todayCounts: Record<string, number> = {}
    if (todayEvents.data) {
      for (const e of todayEvents.data) {
        todayCounts[e.event_type] = (todayCounts[e.event_type] || 0) + 1
      }
    }

    // Aggregate all-time events by type (fallback if RPC doesn't exist)
    let allTimeCounts: Record<string, number> = {}
    if (totalEvents.error) {
      // RPC might not exist yet — fall back to counting from recent events
      // We'll use a full select as fallback
      const allEvents = await supabaseAdmin.from('analytics_events')
        .select('event_type')
      if (allEvents.data) {
        for (const e of allEvents.data) {
          allTimeCounts[e.event_type] = (allTimeCounts[e.event_type] || 0) + 1
        }
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
