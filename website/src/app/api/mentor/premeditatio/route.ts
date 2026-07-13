import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const VALID_VIRTUE_DOMAINS = ['wisdom', 'justice', 'courage', 'temperance'] as const

type PremeditKind = 'weekly_reflection' | 'prepared_disposition'

interface PremeditRow {
  entry_kind: PremeditKind
  anticipated_event: string
  false_impression: string | null
  correct_judgement: string | null
  within_control: string | null
  outside_control: string | null
  virtue_domain: string | null
  virtue_response: string | null
  prepared_disposition: string | null
  avoidance_behaviour_tag: string | null
}

type ParsedContent =
  | { ok: false; error: string }
  | { ok: true; kind: PremeditKind; row: PremeditRow; gateArgs: [string, string, string] }

/**
 * Validate the content fields for either exercise mode and, on success, return
 * the column values (trimmed; the other mode's fields nulled) plus the
 * quality-gate arguments. Shared by POST (insert) and the PATCH content-edit /
 * revise path (update), so the two never drift.
 */
function parsePremeditatioContent(body: Record<string, unknown>): ParsedContent {
  const kind: PremeditKind =
    body.entry_kind === 'prepared_disposition' ? 'prepared_disposition' : 'weekly_reflection'
  const anticipated_event = body.anticipated_event as string | undefined
  const false_impression = body.false_impression as string | undefined
  const correct_judgement = body.correct_judgement as string | undefined
  const avoidance_behaviour_tag = body.avoidance_behaviour_tag as string | undefined
  const within_control = body.within_control as string | undefined
  const outside_control = body.outside_control as string | undefined
  const virtue_domain = body.virtue_domain as string | undefined
  const virtue_response = body.virtue_response as string | undefined
  const prepared_disposition = body.prepared_disposition as string | undefined

  if (!anticipated_event?.trim()) return { ok: false, error: 'Required field: anticipated_event' }

  if (kind === 'weekly_reflection') {
    if (!false_impression?.trim() || !correct_judgement?.trim()) {
      return {
        ok: false,
        error: 'Required fields: anticipated_event, false_impression, correct_judgement',
      }
    }
  } else {
    if (
      !within_control?.trim() ||
      !outside_control?.trim() ||
      !virtue_response?.trim() ||
      !prepared_disposition?.trim()
    ) {
      return {
        ok: false,
        error:
          'Required fields: anticipated_event, within_control, outside_control, virtue_response, prepared_disposition',
      }
    }
    if (
      virtue_domain !== undefined &&
      virtue_domain !== null &&
      virtue_domain !== '' &&
      !(VALID_VIRTUE_DOMAINS as readonly string[]).includes(virtue_domain)
    ) {
      return { ok: false, error: `virtue_domain must be one of: ${VALID_VIRTUE_DOMAINS.join(', ')}` }
    }
  }

  const lengthChecks: ReadonlyArray<readonly [string, unknown]> =
    kind === 'weekly_reflection'
      ? [
          ['Anticipated event', anticipated_event],
          ['False impression', false_impression],
          ['Correct judgement', correct_judgement],
        ]
      : [
          ['Anticipated event', anticipated_event],
          ['What is up to me', within_control],
          ['What is not up to me', outside_control],
          ['Virtue response', virtue_response],
          ['Prepared disposition', prepared_disposition],
        ]
  for (const [field, value] of lengthChecks) {
    const err = validateTextLength(value as string | undefined, field, TEXT_LIMITS.medium)
    if (err) return { ok: false, error: err }
  }

  const isWeekly = kind === 'weekly_reflection'
  return {
    ok: true,
    kind,
    row: {
      entry_kind: kind,
      anticipated_event: anticipated_event.trim(),
      false_impression: isWeekly ? (false_impression as string).trim() : null,
      correct_judgement: isWeekly ? (correct_judgement as string).trim() : null,
      within_control: isWeekly ? null : (within_control as string).trim(),
      outside_control: isWeekly ? null : (outside_control as string).trim(),
      virtue_domain: isWeekly ? null : virtue_domain?.trim() || null,
      virtue_response: isWeekly ? null : (virtue_response as string).trim(),
      prepared_disposition: isWeekly ? null : (prepared_disposition as string).trim(),
      avoidance_behaviour_tag: isWeekly ? avoidance_behaviour_tag?.trim() || null : null,
    },
    gateArgs: isWeekly
      ? [anticipated_event, false_impression as string, correct_judgement as string]
      : [anticipated_event, within_control as string, prepared_disposition as string],
  }
}

function qualityGateBlock(kind: PremeditKind, isGeneric: boolean) {
  const genericMessage =
    kind === 'weekly_reflection'
      ? 'This response was flagged as generic. A premeditatio must name a specific anticipated event, not a general aspiration. Consider revising.'
      : 'This response was flagged as generic. A prepared disposition must be anchored to a specific future scenario, not a general aspiration. Consider revising.'
  return {
    is_generic: isGeneric,
    message: isGeneric ? genericMessage : 'Quality gate passed — response is specific and concrete.',
  }
}

/**
 * POST /api/mentor/premeditatio
 *
 * Two exercise modes on the one surface, selected by `entry_kind`:
 *
 * 'weekly_reflection' (default; the original Gap 3):
 *   1. anticipated_event — a specific upcoming situation
 *   2. false_impression — the false impression most likely to arise
 *   3. correct_judgement — the correct judgement to hold in advance
 *   Optional: linked_passion_event_id, avoidance_behaviour_tag
 *
 * 'prepared_disposition' (Remaining Principles #7-human — premeditatio-as-tool):
 *   1. anticipated_event — a specific future adversity
 *   2. within_control    — what IS up to me in this scenario
 *   3. outside_control   — what is NOT up to me
 *   4. virtue_response   — the virtue the scenario calls for, and how to embody it
 *   5. prepared_disposition — the resulting prepared stance ("not a plan; a disposition")
 *   Optional: virtue_domain (wisdom|justice|courage|temperance)
 *
 * Quality gate (both modes): generic responses are flagged via an LLM check
 * that keys on whether anticipated_event names a specific scenario.
 *
 * @gap Gap 3 — Premeditatio Scheduling (extended for Remaining Principles #7-human)
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()

    const parsed = parsePremeditatioContent(body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const isGeneric = await checkQualityGate(...parsed.gateArgs)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('premeditatio_entries')
      .insert({
        user_id: userId,
        ...parsed.row,
        is_generic: isGeneric,
        linked_passion_event_id: body.linked_passion_event_id || null,
        behaviour_changed: false,
        prompt_sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Premeditatio insert error:', error)
      return NextResponse.json({ error: 'Failed to save premeditatio entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: qualityGateBlock(parsed.kind, isGeneric),
    })
  } catch (err) {
    console.error('Premeditatio API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mentor/premeditatio
 *
 * Two shapes, both requiring `id` and scoped to the authenticated user:
 *   1. Content edit / revise — the body carries `anticipated_event` (+ the
 *      content fields for the entry's `entry_kind`). Re-validates + re-runs the
 *      quality gate and updates the row (used to revise a flagged-generic entry
 *      in place, without re-entering everything or creating a duplicate).
 *   2. Metadata-only — the body carries `behaviour_changed` and/or
 *      `linked_passion_event_id` (e.g. the "Mark changed" button).
 */
export async function PATCH(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Entry id is required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Content edit / revise — present when the body carries the content fields.
    if (body.anticipated_event !== undefined) {
      const parsed = parsePremeditatioContent(body)
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

      const isGeneric = await checkQualityGate(...parsed.gateArgs)

      const { data, error } = await supabase
        .from('premeditatio_entries')
        .update({ ...parsed.row, is_generic: isGeneric })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Premeditatio content-edit error:', error)
        return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        entry: data,
        quality_gate: qualityGateBlock(parsed.kind, isGeneric),
      })
    }

    // Metadata-only update (behaviour_changed / linked_passion_event_id).
    const { behaviour_changed, linked_passion_event_id } = body
    const updateData: Record<string, unknown> = {}
    if (behaviour_changed !== undefined) updateData.behaviour_changed = behaviour_changed
    if (linked_passion_event_id !== undefined) updateData.linked_passion_event_id = linked_passion_event_id

    const { data, error } = await supabase
      .from('premeditatio_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Premeditatio update error:', error)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true, entry: data })
  } catch (err) {
    console.error('Premeditatio PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/premeditatio?view=feed|engagement
 *
 * Retrieve premeditatio entries or engagement stats.
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

  if (view === 'engagement') {
    const { data, error } = await supabase
      .from('premeditatio_engagement')
      .select('*')
      .eq('user_id', userId)
      .order('month_start', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to fetch engagement' }, { status: 500 })
    return NextResponse.json({ view: 'engagement', data: data || [] })
  }

  // Default: feed
  const { data: entries, error } = await supabase
    .from('premeditatio_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })

  return NextResponse.json({
    view: 'feed',
    entries: entries || [],
  })
}

/**
 * Quality gate: uses LLM to detect generic premeditatio responses.
 * Generic = not tied to a specific upcoming situation.
 *
 * Examples of generic (flagged):
 *   "I will be virtuous this week"
 *   "I will stay calm"
 *
 * Examples of specific (pass):
 *   "Monday's meeting with the board about budget cuts"
 *   "The conversation with my partner about moving cities"
 */
async function checkQualityGate(
  anticipatedEvent: string,
  supportingDetailA: string,
  supportingDetailB: string
): Promise<boolean> {
  try {
    // Check cache first
    const ck = cacheKey('/api/mentor/premeditatio/quality-gate', {
      anticipated_event: anticipatedEvent.trim(),
    })
    const cached = cacheGet(ck) as { is_generic: boolean } | undefined
    if (cached !== undefined) return cached.is_generic

    const client = getClient()

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 128,
      system: `You are a quality gate for Stoic premeditatio exercises. Determine if a response describes a SPECIFIC upcoming situation or is GENERIC aspiration.

GENERIC means: vague intentions like "be virtuous", "stay calm", "do better". Not tied to a concrete event.
SPECIFIC means: names a particular event, person, time, place, or situation.

Respond ONLY with: {"is_generic": true} or {"is_generic": false}`,
      messages: [
        {
          role: 'user',
          content: `Anticipated event: ${anticipatedEvent.trim()}
Supporting detail: ${supportingDetailA.trim()}
Supporting detail: ${supportingDetailB.trim()}

Is this generic or specific?`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return false

    const result = JSON.parse(jsonMatch[0])
    cacheSet(ck, result)
    return result.is_generic === true
  } catch (err) {
    console.error('Quality gate check failed:', err)
    // Fail open — don't block the entry if the quality gate itself fails
    return false
  }
}
