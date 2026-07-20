import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'
import { isLlmOutage } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// The quality-gate classification. The LLM is restricted to producing one of
// these three values (a pure classification of the recalibrated reading); the
// tailored message is produced deterministically below, so the LLM never
// authors any Stoic commentary.
type Calibration = 'calibrated' | 'minimised' | 'unchanged'

type ParsedView =
  | { ok: false; error: string }
  | {
      ok: true
      concern: string
      expansion_one_year: string | null
      expansion_ten_years: string | null
      expansion_whole_life: string | null
      expansion_widest_circle: string | null
      fate_acceptance: string | null
      recalibrated_reading: string
    }

/**
 * Validate the view-from-above content fields (shared by POST and the PATCH
 * content-edit / revise path, so the two never drift).
 */
function parseViewContent(body: Record<string, unknown>): ParsedView {
  const concern = body.concern as string | undefined
  const recalibrated_reading = body.recalibrated_reading as string | undefined
  const expansion_one_year = body.expansion_one_year as string | undefined
  const expansion_ten_years = body.expansion_ten_years as string | undefined
  const expansion_whole_life = body.expansion_whole_life as string | undefined
  const expansion_widest_circle = body.expansion_widest_circle as string | undefined
  const fate_acceptance = body.fate_acceptance as string | undefined

  if (!concern?.trim() || !recalibrated_reading?.trim()) {
    return { ok: false, error: 'Required fields: concern, recalibrated_reading' }
  }

  for (const [field, value] of [
    ['Concern', concern],
    ['Recalibrated reading', recalibrated_reading],
    ['One year', expansion_one_year],
    ['Ten years', expansion_ten_years],
    ['Whole life', expansion_whole_life],
    ['Widest circle', expansion_widest_circle],
    ['Fate acceptance', fate_acceptance],
  ] as const) {
    const err = validateTextLength(value, field, TEXT_LIMITS.medium)
    if (err) return { ok: false, error: err }
  }

  return {
    ok: true,
    concern: concern.trim(),
    recalibrated_reading: recalibrated_reading.trim(),
    expansion_one_year: expansion_one_year?.trim() || null,
    expansion_ten_years: expansion_ten_years?.trim() || null,
    expansion_whole_life: expansion_whole_life?.trim() || null,
    expansion_widest_circle: expansion_widest_circle?.trim() || null,
    fate_acceptance: fate_acceptance?.trim() || null,
  }
}

/**
 * The tailored quality-gate message — authored deterministically (not by the
 * LLM), keyed off the classification. `calibrates` is true only for a genuinely
 * calibrated reading; the two failure modes each get a distinct, actionable
 * message and are offered a Revise affordance in the UI.
 */
function calibrationBlock(quality: Calibration) {
  const calibrates = quality === 'calibrated'
  const message =
    quality === 'calibrated'
      ? 'This reading calibrates — it holds the concern at the size it actually has, neither dismissing it nor keeping the weight that catastrophising assigned it.'
      : quality === 'minimised'
      ? 'This reading minimises rather than calibrates — it treats the concern as though it does not matter. The view from above does not say the difficulty is nothing; it says the difficulty has the magnitude it actually has, not the magnitude that grief or fear assigned it. Consider what it would be to see it clearly rather than to dismiss it.'
      : 'The magnitude has not yet moved — the reading still carries the full weight the concern arrived with. Return to the expansions: how does it look in ten years, or from the widest circle you can genuinely inhabit? Then read it again.'
  return { calibration_quality: quality, calibrates, message }
}

/**
 * POST /api/mentor/view-from-above
 *
 * The view from above (the cosmopolitan perspective) — Remaining Principles #9,
 * with the fate-acceptance reframe (#13) folded in. A Zone-2 grief/catastrophising
 * calibration exercise: name a concern that feels overwhelming, walk through
 * three temporal expansions (one year / ten years / your whole life) and one
 * spatial expansion (the widest circle you can genuinely inhabit), meet it with
 * the fate-acceptance reframe, and write a recalibrated reading of its actual
 * magnitude. The tool does not minimise. It calibrates.
 *
 * Human-only. Never touches /api/reason, the signed assessment, or the substrate
 * engine.
 *
 * Body:
 *   concern                 (required) — the concern that feels overwhelming
 *   recalibrated_reading    (required) — the concern read at its actual size
 *   expansion_one_year      (optional) — how it looks in one year
 *   expansion_ten_years     (optional) — how it looks in ten years
 *   expansion_whole_life    (optional) — in the context of your whole life
 *   expansion_widest_circle (optional) — from the widest circle you can genuinely inhabit
 *   fate_acceptance         (optional) — what accepting rather than resisting it looks like
 *
 * Quality gate: an LLM classifies the recalibrated reading as calibrated /
 * minimised / unchanged (classification only); the message is deterministic.
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()

    const parsed = parseViewContent(body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const quality = await classifyCalibration(parsed.concern, parsed.recalibrated_reading)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('view_from_above_entries')
      .insert({
        user_id: userId,
        concern: parsed.concern,
        expansion_one_year: parsed.expansion_one_year,
        expansion_ten_years: parsed.expansion_ten_years,
        expansion_whole_life: parsed.expansion_whole_life,
        expansion_widest_circle: parsed.expansion_widest_circle,
        fate_acceptance: parsed.fate_acceptance,
        recalibrated_reading: parsed.recalibrated_reading,
        calibration_quality: quality,
      })
      .select()
      .single()

    if (error) {
      console.error('View from above insert error:', error)
      return NextResponse.json({ error: 'Failed to save view from above entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: calibrationBlock(quality),
    })
  } catch (err) {
    console.error('View from above API error:', err)
    logRouteError({ route: '/api/mentor/view-from-above', method: 'POST', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mentor/view-from-above
 *
 * Content edit / revise an existing view-from-above entry — re-validates + re-runs
 * the calibration gate and updates the row in place (used to revise an entry the
 * gate flagged as minimised or unchanged, without re-entering everything or
 * creating a duplicate). Body: { id, concern, recalibrated_reading, ...optional }.
 * Scoped to the authenticated user.
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

    const parsed = parseViewContent(body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const quality = await classifyCalibration(parsed.concern, parsed.recalibrated_reading)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('view_from_above_entries')
      .update({
        concern: parsed.concern,
        expansion_one_year: parsed.expansion_one_year,
        expansion_ten_years: parsed.expansion_ten_years,
        expansion_whole_life: parsed.expansion_whole_life,
        expansion_widest_circle: parsed.expansion_widest_circle,
        fate_acceptance: parsed.fate_acceptance,
        recalibrated_reading: parsed.recalibrated_reading,
        calibration_quality: quality,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('View from above update error:', error)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: calibrationBlock(quality),
    })
  } catch (err) {
    console.error('View from above PATCH error:', err)
    logRouteError({ route: '/api/mentor/view-from-above', method: 'PATCH', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/view-from-above?view=feed&limit=50
 *
 * Retrieve the user's view-from-above entries.
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: entries, error } = await supabase
    .from('view_from_above_entries')
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
 * Quality gate: uses an LLM to CLASSIFY the recalibrated reading — nothing more.
 * It returns one of 'calibrated' | 'minimised' | 'unchanged'. The LLM authors no
 * message and no Stoic commentary; the tailored message is produced by the
 * deterministic calibrationBlock() above, keyed off this classification.
 *
 *   calibrated — the reading right-sizes the concern to its actual magnitude,
 *                neither dismissing it as trivial nor keeping the catastrophic weight.
 *   minimised  — the reading dismisses the concern as not mattering / trivial.
 *   unchanged  — the magnitude has not moved; the reading is still catastrophic.
 *
 * Fails OPEN (returns 'calibrated') so a gate outage never blocks a genuine entry.
 */
async function classifyCalibration(
  concern: string,
  recalibratedReading: string
): Promise<Calibration> {
  try {
    const ck = cacheKey('/api/mentor/view-from-above/calibration-gate', {
      concern: concern.trim(),
      recalibrated_reading: recalibratedReading.trim(),
    })
    const cached = cacheGet(ck) as { calibration: Calibration } | undefined
    if (cached !== undefined) return cached.calibration

    const client = getClient()

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 128,
      system: `You are a classifier for a "view from above" perspective exercise. A practitioner names a CONCERN that felt overwhelming and then writes a RECALIBRATED READING of it after stepping back to see it in scale.

Classify the recalibrated reading into EXACTLY one category. Do not add commentary or advice.

"calibrated": the reading right-sizes the concern to the magnitude it actually has — it neither dismisses the concern as not mattering nor keeps the full overwhelming/catastrophic weight it arrived with. It sees the concern clearly, at its true size.

"minimised": the reading dismisses the concern as trivial, as not mattering, as "nothing in the grand scheme", or resolves it by resignation. It makes the concern smaller than it is rather than seeing it clearly.

"unchanged": the magnitude has not moved — the reading still treats the concern as overwhelming or catastrophic, or is a non-answer that does not re-read the concern at all.

Respond ONLY with: {"calibration": "calibrated"} or {"calibration": "minimised"} or {"calibration": "unchanged"}`,
      messages: [
        {
          role: 'user',
          content: `Concern (as it first felt): ${concern.trim()}
Recalibrated reading (after the view from above): ${recalibratedReading.trim()}

Classify the recalibrated reading.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return 'calibrated' // fail open

    const result = JSON.parse(jsonMatch[0])
    const calibration: Calibration =
      result.calibration === 'minimised' || result.calibration === 'unchanged'
        ? result.calibration
        : 'calibrated'
    cacheSet(ck, { calibration })
    return calibration
  } catch (err) {
    console.error('View from above calibration gate failed:', err)
    logRouteError({
      route: '/api/mentor/view-from-above',
      method: 'POST',
      error: err,
      statusCode: 200,
      isLlmOutage: isLlmOutage(err),
      context: { gate: 'calibration-gate', fail_open: true },
    })
    // Fail open — don't block the entry if the gate itself fails
    return 'calibrated'
  }
}
