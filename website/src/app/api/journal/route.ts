import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/journal
 *
 * Submit a journal entry. Creates a record in journal_entries and
 * also registers a journal completion in the practice calendar system.
 *
 * Body: { user_id, day_number, phase_number, reflection_text }
 *
 * For local-storage users, reflection_text will be '__local__' — the actual
 * text stays on their device. We still record the completion for calendar stamps.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, day_number, phase_number, reflection_text } = body

    if (!user_id || !day_number || !reflection_text) {
      return NextResponse.json({ error: 'user_id, day_number, and reflection_text are required' }, { status: 400 })
    }

    if (day_number < 1 || day_number > 56) {
      return NextResponse.json({ error: 'day_number must be between 1 and 56' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for duplicate entry
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user_id)
      .eq('day_number', day_number)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Entry for this day already exists' }, { status: 409 })
    }

    // Check pace control: can't submit next day until the next calendar day
    const { data: lastEntry } = await supabase
      .from('journal_entries')
      .select('day_number, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lastEntry && day_number > 1) {
      const lastDate = new Date(lastEntry.created_at).toISOString().slice(0, 10)
      const today = new Date().toISOString().slice(0, 10)
      if (lastDate === today && day_number > lastEntry.day_number) {
        return NextResponse.json({
          error: 'You can complete one new entry per day. Come back tomorrow for the next one.'
        }, { status: 429 })
      }
    }

    const isLocal = reflection_text === '__local__'
    const wordCount = isLocal ? 0 : reflection_text.trim().split(/\s+/).filter(Boolean).length

    // Insert journal entry
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id,
        day_number,
        phase_number: phase_number || 1,
        reflection_text: isLocal ? '__local__' : reflection_text.trim(),
        word_count: wordCount,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Journal insert error:', error)
      return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      message: `Day ${day_number} complete. Calendar stamp earned.`,
    })
  } catch (err) {
    console.error('Journal API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/journal?user_id=...
 * GET /api/journal?user_id=...&day=5
 *
 * Retrieve journal entries. If day is specified, returns that single entry.
 * Otherwise returns all entries for the user.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  const day = searchParams.get('day')

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (day) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('day_number', parseInt(day))
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  }

  // Return all entries (just day numbers and dates for progress, not full text)
  const { data, error } = await supabase
    .from('journal_entries')
    .select('day_number, phase_number, word_count, created_at')
    .eq('user_id', userId)
    .order('day_number', { ascending: true })

  return NextResponse.json({
    entries: data || [],
    total_days: 56,
    completed_days: data?.length || 0,
    completion_percent: Math.round(((data?.length || 0) / 56) * 100),
  })
}
