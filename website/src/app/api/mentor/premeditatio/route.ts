import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const VALID_VIRTUE_DOMAINS = ['wisdom', 'justice', 'courage', 'temperance'] as const

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
    const {
      entry_kind,
      anticipated_event,
      false_impression,
      correct_judgement,
      linked_passion_event_id,
      avoidance_behaviour_tag,
      within_control,
      outside_control,
      virtue_domain,
      virtue_response,
      prepared_disposition,
    } = body

    // Mode select. A NULL/absent entry_kind is the original weekly reflection.
    const kind = entry_kind === 'prepared_disposition' ? 'prepared_disposition' : 'weekly_reflection'

    // Every entry names a specific anticipated event (both modes).
    if (!anticipated_event?.trim()) {
      return NextResponse.json({ error: 'Required field: anticipated_event' }, { status: 400 })
    }

    if (kind === 'weekly_reflection') {
      if (!false_impression?.trim() || !correct_judgement?.trim()) {
        return NextResponse.json(
          { error: 'Required fields: anticipated_event, false_impression, correct_judgement' },
          { status: 400 }
        )
      }
    } else {
      // prepared_disposition
      if (
        !within_control?.trim() ||
        !outside_control?.trim() ||
        !virtue_response?.trim() ||
        !prepared_disposition?.trim()
      ) {
        return NextResponse.json(
          {
            error:
              'Required fields: anticipated_event, within_control, outside_control, virtue_response, prepared_disposition',
          },
          { status: 400 }
        )
      }
      if (
        virtue_domain !== undefined &&
        virtue_domain !== null &&
        virtue_domain !== '' &&
        !VALID_VIRTUE_DOMAINS.includes(virtue_domain)
      ) {
        return NextResponse.json(
          { error: `virtue_domain must be one of: ${VALID_VIRTUE_DOMAINS.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Text length validation — only the fields the chosen mode provides.
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
      if (err) return NextResponse.json({ error: err }, { status: 400 })
    }

    // Quality gate keys on anticipated_event specificity (both modes); the other
    // two arguments are supporting context only.
    const isGeneric =
      kind === 'weekly_reflection'
        ? await checkQualityGate(anticipated_event, false_impression, correct_judgement)
        : await checkQualityGate(anticipated_event, within_control, prepared_disposition)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('premeditatio_entries')
      .insert({
        user_id: userId,
        entry_kind: kind,
        anticipated_event: anticipated_event.trim(),
        false_impression: kind === 'weekly_reflection' ? false_impression.trim() : null,
        correct_judgement: kind === 'weekly_reflection' ? correct_judgement.trim() : null,
        within_control: kind === 'prepared_disposition' ? within_control.trim() : null,
        outside_control: kind === 'prepared_disposition' ? outside_control.trim() : null,
        virtue_domain: kind === 'prepared_disposition' ? virtue_domain?.trim() || null : null,
        virtue_response: kind === 'prepared_disposition' ? virtue_response.trim() : null,
        prepared_disposition: kind === 'prepared_disposition' ? prepared_disposition.trim() : null,
        is_generic: isGeneric,
        linked_passion_event_id: linked_passion_event_id || null,
        avoidance_behaviour_tag:
          kind === 'weekly_reflection' ? avoidance_behaviour_tag?.trim() || null : null,
        behaviour_changed: false,
        prompt_sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Premeditatio insert error:', error)
      return NextResponse.json({ error: 'Failed to save premeditatio entry' }, { status: 500 })
    }

    const genericMessage =
      kind === 'weekly_reflection'
        ? 'This response was flagged as generic. A premeditatio must name a specific anticipated event, not a general aspiration. Consider revising.'
        : 'This response was flagged as generic. A prepared disposition must be anchored to a specific future scenario, not a general aspiration. Consider revising.'

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: {
        is_generic: isGeneric,
        message: isGeneric ? genericMessage : 'Quality gate passed — response is specific and concrete.',
      },
    })
  } catch (err) {
    console.error('Premeditatio API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mentor/premeditatio
 *
 * Update a premeditatio entry — primarily for marking behaviour_changed.
 * Body: { id, behaviour_changed: true }
 */
export async function PATCH(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()
    const { id, behaviour_changed, linked_passion_event_id } = body

    if (!id) {
      return NextResponse.json({ error: 'Entry id is required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
