import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { enforceDistressCheck } from '@/lib/constraints'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import {
  isR20aGapClosureEnabled,
  composeDistressSubject,
  buildMildSupportResources,
} from '@/lib/r20a-gap-closure'
import {
  PATTERN_CONSECUTIVE_MISSES,
  resolvePassionLogPattern,
  type SuggestedPractice,
} from '@/lib/practice-sequence'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Valid passion types from the Stoic taxonomy.
 * Four root families with sub-species.
 */
const VALID_PASSION_TYPES = [
  // Epithumia family
  'philodoxia', 'orge', 'pothos', 'philedonia', 'philoplousia', 'eros',
  // Phobos family
  'agonia', 'oknos', 'aischyne', 'deima', 'thambos', 'thorybos',
  // Lupe family
  'penthos', 'phthonos', 'zelotypia', 'eleos', 'achos',
  // Hedone family
  'kelesis', 'epichairekakia', 'terpsis',
] as const

/**
 * POST /api/mentor/passion-log
 *
 * Log a passion event with self-diagnosis.
 * Body: { passion_type, intensity, caught_before_assent, false_judgement, description?, linked_journal_entry_id? }
 *
 * @gap Gap 2 — Passion Log + Classification
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()
    const { passion_type, intensity, caught_before_assent, false_judgement, description, linked_journal_entry_id } = body

    // ── R20a perimeter (AC5; added 2026-08-17, gap closure) ─────────────────
    // This route was OUTSIDE the perimeter. `false_judgement` asks the
    // practitioner for the belief that drove their own fear, anger, grief or
    // shame, and `description` for the event itself — the purest instance of
    // the content class the mentor's B3 ruling placed inside the perimeter
    // (see r20a-gap-closure.ts). Nothing screened either field.
    //
    // Runs BEFORE every field validation below and before the store write.
    // Flag-off is byte-identical.
    let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
    if (isR20aGapClosureEnabled()) {
      const gate = await enforceDistressCheck(
        detectDistressTwoStage(composeDistressSubject([false_judgement, description]))
      )
      if (gate.result.distress_detected && gate.result.severity !== 'mild') {
        return NextResponse.json({
          distress_detected: true,
          severity: gate.result.severity,
          redirect_message: gate.result.redirect_message,
        })
      }
      if (gate.result.severity === 'mild') {
        mildSupport = buildMildSupportResources('passion')
      }
    }

    // Validate required fields
    if (!passion_type || intensity === undefined || caught_before_assent === undefined || !false_judgement?.trim()) {
      return NextResponse.json(
        { error: 'Required fields: passion_type, intensity, caught_before_assent, false_judgement' },
        { status: 400 }
      )
    }

    // Validate passion type
    if (!VALID_PASSION_TYPES.includes(passion_type)) {
      return NextResponse.json(
        { error: `Invalid passion_type. Must be one of: ${VALID_PASSION_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate intensity range
    if (!Number.isInteger(intensity) || intensity < 1 || intensity > 5) {
      return NextResponse.json(
        { error: 'intensity must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate boolean
    if (typeof caught_before_assent !== 'boolean') {
      return NextResponse.json(
        { error: 'caught_before_assent must be a boolean' },
        { status: 400 }
      )
    }

    // Text length validation
    const judgementErr = validateTextLength(false_judgement, 'False judgement', TEXT_LIMITS.medium)
    if (judgementErr) return NextResponse.json({ error: judgementErr }, { status: 400 })

    if (description) {
      const descErr = validateTextLength(description, 'Description', TEXT_LIMITS.medium)
      if (descErr) return NextResponse.json({ error: descErr }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const insertData: Record<string, unknown> = {
      user_id: userId,
      passion_type,
      intensity,
      caught_before_assent,
      false_judgement: false_judgement.trim(),
      description: description?.trim() || null,
      linked_journal_entry_id: linked_journal_entry_id || null,
    }

    const { data, error } = await supabase
      .from('passion_events')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Passion log insert error:', error)
      return NextResponse.json({ error: 'Failed to save passion event' }, { status: 500 })
    }

    // Phase 2 (the in-session trigger, Step M): at SAVE time only the PATTERN
    // row can answer — the engine's reading does not exist yet (classification
    // is a second round-trip), and the 6b verdict makes the ENGINE's reading
    // the driver of every sub-species row. The classify response carries the
    // full resolution and supersedes this one on the client.
    //
    // Additive + fail-soft: a failed read yields silence (the honest null for
    // an affordance), never an error and never a claimed pattern — a short or
    // unreadable window cannot satisfy resolvePassionLogPattern.
    let suggested: SuggestedPractice | null = null
    try {
      const { data: prior } = await supabase
        .from('passion_events')
        .select('caught_before_assent')
        .eq('user_id', userId)
        .neq('id', data.id)
        .lt('created_at', data.created_at)
        .order('created_at', { ascending: false })
        .limit(PATTERN_CONSECUTIVE_MISSES - 1)
      suggested = resolvePassionLogPattern([
        caught_before_assent,
        // Raw pass-through: a null/unknown stored value breaks the pattern
        // (fails toward silence) rather than being coerced into a miss.
        ...(prior ?? []).map((r) => r.caught_before_assent as boolean),
      ])
    } catch {
      suggested = null
    }

    return NextResponse.json({
      success: true,
      event: data,
      ...(suggested ? { suggested_practice: suggested } : {}),
      ...(mildSupport ? { support_resources: mildSupport } : {}),
    })
  } catch (err) {
    console.error('Passion log API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/passion-log?limit=50&view=feed|trends|catch-rate|accuracy
 *
 * Retrieve passion events and aggregated views.
 *
 * Views:
 *   feed (default) — chronological list of passion events
 *   trends — intensity trends per passion type (weekly)
 *   catch-rate — weekly pre-assent catch rate (operational signal)
 *   accuracy — classification match rate (quality signal)
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'feed'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  switch (view) {
    case 'trends': {
      const { data, error } = await supabase
        .from('passion_intensity_trends')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: true })
        .limit(limit)

      if (error) return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
      return NextResponse.json({ view: 'trends', data: data || [] })
    }

    case 'catch-rate': {
      const { data, error } = await supabase
        .from('passion_weekly_catch_rate')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: true })
        .limit(limit)

      if (error) return NextResponse.json({ error: 'Failed to fetch catch rate' }, { status: 500 })
      return NextResponse.json({ view: 'catch-rate', data: data || [] })
    }

    case 'accuracy': {
      const { data, error } = await supabase
        .from('passion_classification_accuracy')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Failed to fetch accuracy' }, { status: 500 })
      }
      return NextResponse.json({
        view: 'accuracy',
        data: data || { classified_count: 0, match_count: 0, match_rate_pct: null },
      })
    }

    case 'feed':
    default: {
      const { data: events, error } = await supabase
        .from('passion_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })

      // Also fetch total count
      const { count } = await supabase
        .from('passion_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      return NextResponse.json({
        view: 'feed',
        events: events || [],
        total: count || 0,
      })
    }
  }
}
