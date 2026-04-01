import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'

// Use client-side supabase with user's auth token for RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Proximity level ranking for comparison
const PROXIMITY_RANK: Record<KatorthomaProximityLevel, number> = {
  reflexive: 0,
  habitual: 1,
  deliberate: 2,
  principled: 3,
  sage_like: 4,
}

/**
 * GET /api/practice-calendar?user_id=...&month=2026-03
 *
 * Returns practice activity grouped by day for a given month.
 * Each day lists which virtue domains were engaged through actions and reflections,
 * and tracks the highest katorthoma_proximity level achieved that day.
 *
 * Response shape:
 * {
 *   days: {
 *     "2026-03-15": {
 *       virtues: ["wisdom", "courage"],
 *       strongest_domain: "wisdom",
 *       best_proximity: "deliberate",
 *       stamp_earned: true,
 *       activities: [
 *         { type: "action", description: "...", katorthoma_proximity: "deliberate", virtue_domains_engaged: ["wisdom", "courage"] },
 *         { type: "reflection", katorthoma_proximity: "habitual", virtue_domains_engaged: ["wisdom"] }
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

  // Fetch action evaluations (V3), reflections, and journal entries for the month in parallel
  const [actionsRes, reflectionsRes, journalRes] = await Promise.all([
    supabase
      .from('action_evaluations_v3')
      .select('id, action_description, katorthoma_proximity, virtue_domains_engaged, passions_detected, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .order('created_at', { ascending: true }),
    supabase
      .from('reflections')
      .select('id, katorthoma_proximity, virtue_domains_engaged, created_at')
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

  // Stamp threshold — a day earns a calendar stamp when the best activity
  // that day achieves katorthoma_proximity of 'deliberate' or higher.
  const STAMP_PROXIMITY_THRESHOLD = 'deliberate'

  // Group by day (using user's local date from the ISO timestamp)
  const days: Record<string, {
    virtues: Set<string>
    proximities: KatorthomaProximityLevel[]
    activities: Array<{
      type: 'action' | 'reflection' | 'journal'
      description?: string
      katorthoma_proximity: KatorthomaProximityLevel
      virtue_domains_engaged: string[]
    }>
  }> = {}

  function ensureDay(dateStr: string) {
    // Extract YYYY-MM-DD from ISO timestamp
    const day = dateStr.slice(0, 10)
    if (!days[day]) {
      days[day] = { virtues: new Set(), proximities: [], activities: [] }
    }
    return day
  }

  // Process action evaluations (V3)
  if (actionsRes.data) {
    for (const action of actionsRes.data) {
      const day = ensureDay(action.created_at)
      const domains = (action.virtue_domains_engaged as string[]) || []
      domains.forEach(v => days[day].virtues.add(v))
      days[day].proximities.push(action.katorthoma_proximity)
      days[day].activities.push({
        type: 'action',
        description: action.action_description?.slice(0, 80),
        katorthoma_proximity: action.katorthoma_proximity,
        virtue_domains_engaged: domains,
      })
    }
  }

  // Process reflections
  if (reflectionsRes.data) {
    for (const reflection of reflectionsRes.data) {
      const day = ensureDay(reflection.created_at)
      const domains = (reflection.virtue_domains_engaged as string[]) || []
      domains.forEach(v => days[day].virtues.add(v))
      // Only add proximity if available in the reflection record
      if (reflection.katorthoma_proximity) {
        days[day].proximities.push(reflection.katorthoma_proximity)
        days[day].activities.push({
          type: 'reflection',
          katorthoma_proximity: reflection.katorthoma_proximity,
          virtue_domains_engaged: domains,
        })
      }
    }
  }

  // Process journal entries — these are tracked but don't contribute to proximity scoring
  if (journalRes.data) {
    for (const journal of journalRes.data) {
      const day = ensureDay(journal.created_at)
      days[day].activities.push({
        type: 'journal',
        description: `Journal Day ${journal.day_number}`,
        katorthoma_proximity: 'reflexive', // journal entries are logged as baseline activity
        virtue_domains_engaged: [],
      })
    }
  }

  // Convert Sets to arrays and compute strongest domain per day
  // Also determine whether the day earns a calendar stamp (best proximity >= 'deliberate')
  const serializedDays: Record<string, {
    virtues: string[]
    strongest_domain: string | null
    best_proximity: KatorthomaProximityLevel | null
    stamp_earned: boolean
    activities: typeof days[string]['activities']
  }> = {}

  for (const [day, data] of Object.entries(days)) {
    // Calculate frequency of each virtue domain across all activities that day
    const domainCounts: Record<string, number> = {}
    for (const activity of data.activities) {
      for (const domain of activity.virtue_domains_engaged) {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1
      }
    }

    // Find the domain engaged most frequently that day
    let strongest: string | null = null
    let highestCount = 0
    for (const [domain, count] of Object.entries(domainCounts)) {
      if (count > highestCount) {
        highestCount = count
        strongest = domain
      }
    }

    // Find the highest proximity level achieved that day
    let bestProximity: KatorthomaProximityLevel | null = null
    let bestProximityRank = -1
    for (const proximity of data.proximities) {
      const rank = PROXIMITY_RANK[proximity]
      if (rank > bestProximityRank) {
        bestProximityRank = rank
        bestProximity = proximity
      }
    }

    // Determine if day earns a stamp (best proximity >= 'deliberate')
    const stampEarned = bestProximity !== null && PROXIMITY_RANK[bestProximity] >= PROXIMITY_RANK[STAMP_PROXIMITY_THRESHOLD]

    serializedDays[day] = {
      virtues: Array.from(data.virtues),
      strongest_domain: strongest,
      best_proximity: bestProximity,
      stamp_earned: stampEarned,
      activities: data.activities,
    }
  }

  return NextResponse.json({
    month: targetMonth,
    days: serializedDays,
  })
}
