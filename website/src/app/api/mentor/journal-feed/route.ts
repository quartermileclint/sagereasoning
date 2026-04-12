import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/mentor/journal-feed
 *
 * Create a real-time journal entry capturing the causal sequence:
 * impression → assent → action.
 *
 * Body: { impression, assent, action, event_timestamp? }
 * All three text fields required. event_timestamp optional (ISO string).
 *
 * @gap Gap 1 — Real-Time Journal Feed
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()
    const { impression, assent, action, event_timestamp } = body

    // Validate required fields
    if (!impression?.trim() || !assent?.trim() || !action?.trim()) {
      return NextResponse.json(
        { error: 'All three fields are required: impression, assent, action' },
        { status: 400 }
      )
    }

    // Text length validation
    const impressionErr = validateTextLength(impression, 'Impression', TEXT_LIMITS.medium)
    if (impressionErr) return NextResponse.json({ error: impressionErr }, { status: 400 })

    const assentErr = validateTextLength(assent, 'Assent', TEXT_LIMITS.medium)
    if (assentErr) return NextResponse.json({ error: assentErr }, { status: 400 })

    const actionErr = validateTextLength(action, 'Action', TEXT_LIMITS.medium)
    if (actionErr) return NextResponse.json({ error: actionErr }, { status: 400 })

    // Validate event_timestamp if provided
    let parsedEventTimestamp: string | null = null
    if (event_timestamp) {
      const ts = new Date(event_timestamp)
      if (isNaN(ts.getTime())) {
        return NextResponse.json({ error: 'Invalid event_timestamp format' }, { status: 400 })
      }
      if (ts > new Date()) {
        return NextResponse.json({ error: 'event_timestamp cannot be in the future' }, { status: 400 })
      }
      parsedEventTimestamp = ts.toISOString()
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('realtime_journal_entries')
      .insert({
        user_id: userId,
        impression: impression.trim(),
        assent: assent.trim(),
        action: action.trim(),
        event_timestamp: parsedEventTimestamp,
      })
      .select()
      .single()

    if (error) {
      console.error('Journal feed insert error:', error)
      return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
    })
  } catch (err) {
    console.error('Journal feed API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/journal-feed?limit=20&offset=0
 *
 * Retrieve real-time journal entries for the authenticated user.
 * Returns entries in reverse chronological order with lag metrics.
 *
 * Also returns aggregate stats: total entries, avg lag, % under 24h.
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch entries
  const { data: entries, error: entriesError } = await supabase
    .from('realtime_journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (entriesError) {
    console.error('Journal feed fetch error:', entriesError)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }

  // Fetch aggregate stats
  const { data: stats, error: statsError } = await supabase
    .from('realtime_journal_lag_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Total count for pagination
  const { count } = await supabase
    .from('realtime_journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return NextResponse.json({
    entries: entries || [],
    stats: stats || {
      total_entries: 0,
      avg_lag_hours: null,
      pct_under_24h: null,
      first_entry: null,
      latest_entry: null,
    },
    total: count || 0,
    limit,
    offset,
  })
}
