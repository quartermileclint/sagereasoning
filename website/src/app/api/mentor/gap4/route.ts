/**
 * /api/mentor/gap4 — Gap 4: Project-Self Integration Report
 *
 * Tracks whether the founder's project decisions diverge from their
 * personal Stoic practice. The mentor holds the review — the system
 * provides data, not interpretation.
 *
 * POST: Submit a Gap 4 entry (prompted or spontaneous)
 *   Body: {
 *     entry_type: 'prompted' | 'spontaneous',
 *     month_number: 1-6,
 *     divergence_reported: boolean,
 *     divergence_description?: string,
 *     philodoxia_in_product_decision: boolean,
 *     content: string
 *   }
 *
 * GET: Retrieve entries or review data
 *   ?view=feed         — Chronological entries (default)
 *   ?view=schedule     — Current prompt schedule status
 *   ?view=review_m3    — Month 3 review data (cross-refs Gap 2)
 *   ?view=review_m6    — Month 6 review data (cross-refs Gap 2)
 *   ?view=suspect      — Flagged suspect entries only
 *
 * PATCH: Start or update a Gap 4 cycle
 *   Body: { action: 'start_cycle' } — Initialise the 6-month schedule
 *
 * Access: Founder only (FOUNDER_USER_ID env var)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAuth, checkRateLimit, RATE_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

// ─── Sunday Prompt Schedule Logic ───────────────────────────────────

/**
 * Determine if a prompt should be sent today based on the cycle month.
 *
 * Schedule:
 *   Month 1:    Every Sunday (weekly)
 *   Months 2–4: First Sunday of the month (monthly)
 *   Months 5–6: No automatic prompts (self-initiated only)
 */
function shouldPromptToday(
  cycleStartDate: Date,
  today: Date = new Date()
): { shouldPrompt: boolean; currentMonth: number; reason: string } {
  const dayOfWeek = today.getDay() // 0 = Sunday
  if (dayOfWeek !== 0) {
    return { shouldPrompt: false, currentMonth: 0, reason: 'Not a Sunday' }
  }

  // Calculate which month of the cycle we're in
  const msPerDay = 86_400_000
  const daysSinceStart = Math.floor((today.getTime() - cycleStartDate.getTime()) / msPerDay)
  const currentMonth = Math.min(6, Math.floor(daysSinceStart / 30) + 1)

  if (currentMonth > 6) {
    return { shouldPrompt: false, currentMonth: 6, reason: 'Cycle complete (past month 6)' }
  }

  if (currentMonth >= 5) {
    return { shouldPrompt: false, currentMonth, reason: `Month ${currentMonth}: no automatic prompts (self-initiated only)` }
  }

  if (currentMonth === 1) {
    // Weekly prompts in month 1 — every Sunday
    return { shouldPrompt: true, currentMonth, reason: 'Month 1: weekly Sunday prompt' }
  }

  // Months 2–4: first Sunday of the month only
  const dayOfMonth = today.getDate()
  if (dayOfMonth <= 7) {
    return { shouldPrompt: true, currentMonth, reason: `Month ${currentMonth}: first Sunday of the month` }
  }

  return { shouldPrompt: false, currentMonth, reason: `Month ${currentMonth}: not the first Sunday` }
}

/**
 * Auto-flag logic: entries reporting no divergence in months 1–3 are suspect.
 * It's statistically unlikely to have zero project-self divergence early in practice.
 */
function shouldFlagSuspect(monthNumber: number, divergenceReported: boolean): boolean {
  return monthNumber <= 3 && !divergenceReported
}

// ─── POST: Submit a Gap 4 entry ─────────────────────────────────────

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // Founder-only gate
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'Gap 4 is restricted to the founder.' },
      { status: 403, headers: corsHeaders() }
    )
  }

  try {
    const body = await request.json()
    const {
      entry_type,
      month_number,
      divergence_reported,
      divergence_description,
      philodoxia_in_product_decision,
      content,
    } = body

    // ── Validation ────────────────────────────────────────────────────

    if (!['prompted', 'spontaneous'].includes(entry_type)) {
      return NextResponse.json(
        { error: `Invalid entry_type: "${entry_type}". Must be 'prompted' or 'spontaneous'.` },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!Number.isInteger(month_number) || month_number < 1 || month_number > 6) {
      return NextResponse.json(
        { error: `Invalid month_number: ${month_number}. Must be 1–6.` },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (typeof divergence_reported !== 'boolean') {
      return NextResponse.json(
        { error: 'divergence_reported is required (boolean).' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (divergence_reported && (!divergence_description || divergence_description.trim().length < 10)) {
      return NextResponse.json(
        { error: 'When divergence is reported, divergence_description is required (min 10 chars).' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'content is required (min 10 characters).' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'content too long (max 5000 characters).' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // ── Auto-flag suspect entries ─────────────────────────────────────

    const flaggedSuspect = shouldFlagSuspect(month_number, divergence_reported)

    // ── Insert ────────────────────────────────────────────────────────

    const { data, error } = await supabaseAdmin
      .from('gap4_entries')
      .insert({
        user_id: auth.user.id,
        entry_date: new Date().toISOString().split('T')[0],
        entry_type,
        month_number,
        divergence_reported,
        divergence_description: divergence_description?.trim() || null,
        philodoxia_in_product_decision: philodoxia_in_product_decision || false,
        content: content.trim(),
        flagged_suspect: flaggedSuspect,
      })
      .select('id, entry_date, entry_type, month_number, divergence_reported, flagged_suspect')
      .single()

    if (error) {
      console.error('[gap4] Insert error:', error)
      return NextResponse.json(
        { error: `Failed to save Gap 4 entry: ${error.message}` },
        { status: 500, headers: corsHeaders() }
      )
    }

    // ── Update schedule if prompted ───────────────────────────────────

    if (entry_type === 'prompted') {
      await supabaseAdmin
        .from('gap4_prompt_schedule')
        .update({
          last_prompt_date: new Date().toISOString().split('T')[0],
          current_month: month_number,
        })
        .eq('user_id', auth.user.id)
        .eq('active', true)

      // Increment prompts_sent
      const { data: schedule } = await supabaseAdmin
        .from('gap4_prompt_schedule')
        .select('id, prompts_sent')
        .eq('user_id', auth.user.id)
        .eq('active', true)
        .single()

      if (schedule) {
        await supabaseAdmin
          .from('gap4_prompt_schedule')
          .update({ prompts_sent: (schedule.prompts_sent || 0) + 1 })
          .eq('id', schedule.id)
      }
    }

    return NextResponse.json(
      {
        entry: data,
        flagged_suspect: flaggedSuspect,
        flag_reason: flaggedSuspect
          ? `No divergence reported in month ${month_number} (months 1–3 are auto-flagged when no divergence is reported — it is statistically unlikely this early in practice).`
          : null,
      },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[gap4] POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// ─── GET: Retrieve entries and review data ──────────────────────────

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'Gap 4 is restricted to the founder.' },
      { status: 403, headers: corsHeaders() }
    )
  }

  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'feed'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    switch (view) {
      case 'feed': {
        const { data, error } = await supabaseAdmin
          .from('gap4_entries')
          .select('*')
          .eq('user_id', auth.user.id)
          .order('entry_date', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error
        return NextResponse.json({ view: 'feed', entries: data }, { headers: corsHeaders() })
      }

      case 'schedule': {
        const { data: schedule } = await supabaseAdmin
          .from('gap4_prompt_schedule')
          .select('*')
          .eq('user_id', auth.user.id)
          .eq('active', true)
          .single()

        if (!schedule) {
          return NextResponse.json(
            { view: 'schedule', active: false, message: 'No active Gap 4 cycle. Use PATCH to start one.' },
            { headers: corsHeaders() }
          )
        }

        // Calculate current prompt status
        const promptStatus = shouldPromptToday(
          new Date(schedule.cycle_start_date),
          new Date()
        )

        return NextResponse.json(
          {
            view: 'schedule',
            active: true,
            cycle_start_date: schedule.cycle_start_date,
            current_month: promptStatus.currentMonth,
            prompts_sent: schedule.prompts_sent,
            last_prompt_date: schedule.last_prompt_date,
            prompt_due_today: promptStatus.shouldPrompt,
            prompt_reason: promptStatus.reason,
          },
          { headers: corsHeaders() }
        )
      }

      case 'review_m3': {
        const { data, error } = await supabaseAdmin
          .from('gap4_month3_review')
          .select('*')
          .eq('user_id', auth.user.id)
          .single()

        if (error || !data) {
          return NextResponse.json(
            { view: 'review_m3', available: false, message: 'Not enough data for month 3 review yet.' },
            { headers: corsHeaders() }
          )
        }

        return NextResponse.json(
          { view: 'review_m3', available: true, review: data },
          { headers: corsHeaders() }
        )
      }

      case 'review_m6': {
        const { data, error } = await supabaseAdmin
          .from('gap4_month6_review')
          .select('*')
          .eq('user_id', auth.user.id)
          .single()

        if (error || !data) {
          return NextResponse.json(
            { view: 'review_m6', available: false, message: 'Not enough data for month 6 review yet.' },
            { headers: corsHeaders() }
          )
        }

        return NextResponse.json(
          { view: 'review_m6', available: true, review: data },
          { headers: corsHeaders() }
        )
      }

      case 'suspect': {
        const { data, error } = await supabaseAdmin
          .from('gap4_entries')
          .select('*')
          .eq('user_id', auth.user.id)
          .eq('flagged_suspect', true)
          .order('entry_date', { ascending: false })

        if (error) throw error
        return NextResponse.json({ view: 'suspect', entries: data }, { headers: corsHeaders() })
      }

      default:
        return NextResponse.json(
          { error: `Invalid view: "${view}". Use: feed, schedule, review_m3, review_m6, suspect` },
          { status: 400, headers: corsHeaders() }
        )
    }
  } catch (err) {
    console.error('[gap4] GET error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// ─── PATCH: Start or manage a Gap 4 cycle ───────────────────────────

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'Gap 4 is restricted to the founder.' },
      { status: 403, headers: corsHeaders() }
    )
  }

  try {
    const { action } = await request.json()

    if (action === 'start_cycle') {
      // Check for existing active cycle
      const { data: existing } = await supabaseAdmin
        .from('gap4_prompt_schedule')
        .select('id')
        .eq('user_id', auth.user.id)
        .eq('active', true)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'An active Gap 4 cycle already exists. Complete or deactivate it first.' },
          { status: 409, headers: corsHeaders() }
        )
      }

      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      // Calculate next Sunday
      const daysUntilSunday = (7 - today.getDay()) % 7
      const nextSunday = new Date(today)
      nextSunday.setDate(today.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday))

      const { data: _data, error } = await supabaseAdmin
        .from('gap4_prompt_schedule')
        .insert({
          user_id: auth.user.id,
          cycle_start_date: todayStr,
          current_month: 1,
          next_prompt_date: nextSunday.toISOString().split('T')[0],
          active: true,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: `Failed to start cycle: ${error.message}` },
          { status: 500, headers: corsHeaders() }
        )
      }

      return NextResponse.json(
        {
          message: 'Gap 4 cycle started.',
          cycle_start_date: todayStr,
          first_prompt_date: nextSunday.toISOString().split('T')[0],
          schedule: 'Month 1: weekly Sunday prompts. Months 2–4: monthly (first Sunday). Months 5–6: no prompts (self-initiated).',
        },
        { status: 201, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      { error: `Unknown action: "${action}". Supported: start_cycle` },
      { status: 400, headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[gap4] PATCH error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// ─── OPTIONS: CORS preflight ────────────────────────────────────────

export async function OPTIONS() {
  return corsPreflightResponse()
}
