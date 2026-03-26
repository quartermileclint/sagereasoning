import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'

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
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const userId = auth.user.id
  const month = searchParams.get('month') // format: "2026-03"

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

  // Fetch action scores, reflections, and journal entries for the month in parallel
  const [actionsRes, reflectionsRes, journalRes] = await Promise.all([
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
    supabase
      .from('journal_entries')
      .select('id, day_number, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .order('created_at', { ascending: true }),
  ])

  // Stamp threshold — a day only earns a calendar stamp when the best activity
  // that day scores a weighted total of 70+ (aligned with the "Progressing" tier).
  // Individual virtues are still tracked for detail panels regardless of threshold.
  const STAMP_THRESHOLD = 70

  // Virtue demonstration threshold — score >= 50 means the virtue was meaningfully present
  // (used for per-virtue tracking within the day detail panel)
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

  // Process journal entries — these earn stamps for tenacity (completion) not virtue scores
  if (journalRes.data) {
    for (const journal of journalRes.data) {
      const day = ensureDay(journal.created_at)
      days[day].activities.push({
        type: 'journal' as any,
        description: `Journal Day ${journal.day_number}`,
        total_score: 70, // meets stamp threshold — journal completion always earns a stamp
        virtues_demonstrated: [],
      })
    }
  }

  // Convert Sets to arrays and compute strongest virtue per day
  // Also determine whether the day earns a calendar stamp (best total_score >= 70)
  const serializedDays: Record<string, {
    virtues: string[]
    strongest_virtue: string | null
    stamp_earned: boolean
    best_total_score: number
    activities: typeof days[string]['activities']
  }> = {}

  for (const [day, data] of Object.entries(days)) {
    // Calculate average score per virtue across all activities that day
    const virtueTotals: Record<string, { sum: number; count: number }> = {}
    for (const activity of data.activities) {
      for (const v of virtueKeys) {
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

    // Check if any activity this day meets the stamp threshold (total_score >= 70)
    const bestTotalScore = Math.max(...data.activities.map(a => a.total_score), 0)
    const stampEarned = bestTotalScore >= STAMP_THRESHOLD

    serializedDays[day] = {
      virtues: Array.from(data.virtues),
      strongest_virtue: strongest,
      stamp_earned: stampEarned,
      best_total_score: bestTotalScore,
      activities: data.activities,
    }
  }

  return NextResponse.json({
    month: targetMonth,
    days: serializedDays,
  })
}
