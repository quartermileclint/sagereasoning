import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const VALID_STAGES = ['self', 'household', 'community', 'humanity', 'cosmic'] as const
const VALID_RETURNS = ['yes', 'no', 'partial'] as const

/**
 * POST /api/mentor/oikeiosis
 *
 * Submit a quarterly oikeiosis reflection.
 * Body: { quarter, year, stage, action_description, reputational_return?, linked_passion_event_id? }
 *
 * Philodoxia flag is automatically set when reputational_return = 'yes'.
 *
 * @gap Gap 5 — Oikeiosis Extension Tracking
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()
    const { quarter, year, stage, action_description, reputational_return, linked_passion_event_id } = body

    // Validate required fields
    if (!quarter || !year || !stage || !action_description?.trim()) {
      return NextResponse.json(
        { error: 'Required fields: quarter, year, stage, action_description' },
        { status: 400 }
      )
    }

    if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
      return NextResponse.json({ error: 'quarter must be 1-4' }, { status: 400 })
    }

    if (!Number.isInteger(year) || year < 2024 || year > 2100) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: `stage must be one of: ${VALID_STAGES.join(', ')}` },
        { status: 400 }
      )
    }

    if (reputational_return && !VALID_RETURNS.includes(reputational_return)) {
      return NextResponse.json(
        { error: `reputational_return must be one of: ${VALID_RETURNS.join(', ')}` },
        { status: 400 }
      )
    }

    const descErr = validateTextLength(action_description, 'Action description', TEXT_LIMITS.medium)
    if (descErr) return NextResponse.json({ error: descErr }, { status: 400 })

    // Auto-flag philodoxia when reputational return = yes
    const philodoxiaFlagged = reputational_return === 'yes'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('oikeiosis_reflections')
      .insert({
        user_id: userId,
        quarter,
        year,
        stage,
        action_description: action_description.trim(),
        reputational_return: reputational_return || null,
        philodoxia_flagged: philodoxiaFlagged,
        linked_passion_event_id: linked_passion_event_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Oikeiosis insert error:', error)
      return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reflection: data,
      philodoxia_warning: philodoxiaFlagged
        ? 'This action was flagged for philodoxia review — reputational return detected. Examine whether the action extended genuine concern or served reputation.'
        : null,
    })
  } catch (err) {
    console.error('Oikeiosis API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/oikeiosis?view=feed|progression
 *
 * Retrieve oikeiosis reflections or stage progression data.
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'feed'

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (view === 'progression') {
    const { data, error } = await supabase
      .from('oikeiosis_stage_progression')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to fetch progression' }, { status: 500 })
    return NextResponse.json({ view: 'progression', data: data || [] })
  }

  // Default: feed
  const { data: reflections, error } = await supabase
    .from('oikeiosis_reflections')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: 'Failed to fetch reflections' }, { status: 500 })

  return NextResponse.json({
    view: 'feed',
    reflections: reflections || [],
  })
}
