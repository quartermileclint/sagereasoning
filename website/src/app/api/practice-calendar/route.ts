import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use client-side supabase with user's auth token for RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * GET /api/practice-calendar?user_id=...&month=2026-03
 *
 * Returns practice activity grouped by day for a given month.
 * Each day lists which virtues were demonstrated (score >= 50 in that virtue)
 * through action scoring or daily reflections.
 *
 * Response shape:
 * {
 *   days: {
 *     "2026-03-15": {
 *       virtues: ["wisdom", "courage"],
 *       activities: [
 *         { type: "action", description: "...", total_score: 72, virtues_demonstrated: ["wisdom", "courage"] },
 *         { type: "reflection", total_score: 68, virtues_demonstrated: ["wisdom"] }
 *       ]
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  const month = searchParams.get('month') // format: "2026-03"

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  // Default to current month
  const now = new Date()
  const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Calculate date range for the month
  const [year, mon] = targetMonth.split('-').map(Number)
  const startDate = new Date(year, mon - 1, 1).toISOString()
  const endDate = new Date(year, mon, 1).toISOString() // first day of next month

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: request.headers.get('Authorization') || '',
      },
    },
  })

  // Fetch action scores and reflections for the month in parallel
  const [actionsRes, reflectionsRes] = await Promise.all([
    supabase
      .from('action_scores')
      .select('id, action_description, total_score, wisdom_score, justice_score, courage_score, temperance_score, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .order('created_at', { ascending: true }),
    supabase
      .from('reflections')
      .select('id, total_score, wisdom_score, justice_score, courage_score, temperance_score, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .order('created_at', { ascending: true }),
  ])

  // Virtue demonstration threshold — score >= 50 means the virtue was meaningfully present
  const VIRTUE_THRESHOLD = 50
  const virtueKeys = ['wisdom', 'justice', 'courage', 'temperance'] as const

  function getVirtuesDemonstrated(record: { wisdom_score: number; justice_score: number; courage_score: number; temperance_score: number }) {
    return virtueKeys.filter(v => record[`${v}_score` as keyof typeof record] >= VIRTUE_THRESHOLD)
  }

  // Group by day (using user's local date from the ISO timestamp)
  const days: Record<string, {
    virtues: Set<string>
    activities: Array<{
      type: 'action' | 'reflection'
      description?: string
      total_score: number
      virtues_demonstrated: string[]
    }>
  }> = {}

  function ensureDay(dateStr: string) {
    // Extract YYYY-MM-DD from ISO timestamp
    const day = dateStr.slice(0, 10)
    if (!days[day]) {
      days[day] = { virtues: new Set(), activities: [] }
    }
    return day
  }

  // Process action scores
  if (actionsRes.data) {
    for (const action of actionsRes.data) {
      const day = ensureDay(action.created_at)
      const demonstrated = getVirtuesDemonstrated(action)
      demonstrated.forEach(v => days[day].virtues.add(v))
      days[day].activities.push({
        type: 'action',
        description: action.action_description?.slice(0, 80),
        total_score: action.total_score,
        virtues_demonstrated: demonstrated,
      })
    }
  }

  // Process reflections
  if (reflectionsRes.data) {
    for (const reflection of reflectionsRes.data) {
      const day = ensureDay(reflection.created_at)
      const demonstrated = getVirtuesDemonstrated(reflection)
      demonstrated.forEach(v => days[day].virtues.add(v))
      days[day].activities.push({
        type: 'reflection',
        total_score: reflection.total_score,
        virtues_demonstrated: demonstrated,
      })
    }
  }

  // Convert Sets to arrays and compute strongest virtue per day
  const serializedDays: Record<string, {
    virtues: string[]
    strongest_virtue: string | null
    activities: typeof days[string]['activities']
  }> = {}

  for (const [day, data] of Object.entries(days)) {
    // Calculate average score per virtue across all activities that day
    const virtueTotals: Record<string, { sum: number; count: number }> = {}
    for (const activity of data.activities) {
      for (const v of virtueKeys) {
        // Find the raw score from the original records
        // We already have virtues_demonstrated, but need actual scores for ranking
        // Use a simple heuristic: if demonstrated (>= threshold), count it
        if (!virtueTotals[v]) virtueTotals[v] = { sum: 0, count: 0 }
      }
      for (const v of activity.virtues_demonstrated) {
        virtueTotals[v].sum += 1
        virtueTotals[v].count += 1
      }
    }

    // Find the virtue demonstrated most frequently that day
    let strongest: string | null = null
    let highestCount = 0
    for (const [v, totals] of Object.entries(virtueTotals)) {
      if (totals.count > highestCount) {
        highestCount = totals.count
        strongest = v
      }
    }

    serializedDays[day] = {
      virtues: Array.from(data.virtues),
      strongest_virtue: strongest,
      activities: data.activities,
    }
  }

  return NextResponse.json({
    month: targetMonth,
    days: serializedDays,
  })
}
