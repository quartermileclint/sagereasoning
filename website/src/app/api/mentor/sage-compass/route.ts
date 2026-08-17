import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'
import { isLlmOutage } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import { resolveSageCompass } from '@/lib/practice-sequence'
import { enforceDistressCheck } from '@/lib/constraints'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import {
  isR20aGapClosureEnabled,
  composeDistressSubject,
  buildMildSupportResources,
} from '@/lib/r20a-gap-closure'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// The four cardinal virtues, in plain language. Defined LOCALLY on purpose: this
// human surface must not import the engine's virtue-domain vocabulary (the reflect
// engine's proximity-domains module, the Stoic-brain knowledge base, or any
// substrate module), which would put it inside the /api/reason import graph and
// break the measurement-neutrality guarantee. Same pattern as the /oikeiosis
// extension's locally-defined CIRCLES.
const VIRTUES = ['wisdom', 'justice', 'courage', 'temperance'] as const
type Virtue = (typeof VIRTUES)[number]

// The practitioner's OPTIONAL, SELF-SELECTED coarse reading of the distance — the
// "direction of travel" the mentor names ("the practitioner can see the direction
// of travel even when the destination is far").
//
// *** NOT A VERDICT (mentor #14, binding). *** This is CAPTURE: the practitioner
// chooses it for themselves. Nothing in this route computes, scores, ranks, grades,
// or classifies it. Its vocabulary is deliberately its own — the engine's proximity
// ranks are never reused here (the boundary test greps this whole file for them),
// so a compass bearing can never be mistaken for an engine score.
const DISTANCE_READINGS = ['far', 'some_way', 'close'] as const
type DistanceReading = (typeof DISTANCE_READINGS)[number]

// The ONE gated classification — of the COMPLETE EXPRESSION's concreteness only.
// It encodes the mentor's other constraint ("This is not a vague aspiration. It is
// a structured imaginative exercise"). It never sees, and says nothing about, the
// distance.
type ExpressionQuality = 'concrete' | 'vague'

type ParsedCompass =
  | { ok: false; error: string }
  | {
      ok: true
      situation: string
      action_considered: string
      virtue_engaged: Virtue
      complete_expression: string
      distance: string
      distance_reading: DistanceReading | null
    }

/**
 * Validate the sage-compass content fields (shared by POST and the PATCH revise
 * path, so the two can never drift).
 *
 * Required: the situation, the action being considered, the virtue primarily
 * engaged, that virtue's complete expression, and the distance. All five are
 * load-bearing — the exercise is incomplete without any of them. The coarse
 * distance reading is optional (the practitioner may decline to characterise it).
 */
function parseCompassContent(body: Record<string, unknown>): ParsedCompass {
  // typeof-guarded, not a bare `as string` cast: a non-string value of the right
  // key (e.g. situation: 123) must coerce to undefined here and fail the required-
  // field check below with a 400, rather than reach `.trim()` on a non-string and
  // throw a TypeError the caller's try/catch reports as a generic 500.
  const asString = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)
  const situation = asString(body.situation)
  const action_considered = asString(body.action_considered)
  const virtue_engaged = asString(body.virtue_engaged)
  const complete_expression = asString(body.complete_expression)
  const distance = asString(body.distance)
  const rawReading = body.distance_reading

  if (
    !situation?.trim() ||
    !action_considered?.trim() ||
    !virtue_engaged ||
    !complete_expression?.trim() ||
    !distance?.trim()
  ) {
    return {
      ok: false,
      error:
        'Required fields: situation, action_considered, virtue_engaged, complete_expression, distance',
    }
  }

  if (!VIRTUES.includes(virtue_engaged as Virtue)) {
    return { ok: false, error: `virtue_engaged must be one of: ${VIRTUES.join(', ')}` }
  }

  for (const [field, value] of [
    ['Situation', situation],
    ['Action considered', action_considered],
    ['Complete expression', complete_expression],
    ['Distance', distance],
  ] as const) {
    const err = validateTextLength(value, field, TEXT_LIMITS.medium)
    if (err) return { ok: false, error: err }
  }

  // Optional; absent/null/'' → null (the practitioner declined to characterise it).
  let reading: DistanceReading | null = null
  if (rawReading !== undefined && rawReading !== null && rawReading !== '') {
    if (!DISTANCE_READINGS.includes(rawReading as DistanceReading)) {
      return {
        ok: false,
        error: `distance_reading must be one of: ${DISTANCE_READINGS.join(', ')}`,
      }
    }
    reading = rawReading as DistanceReading
  }

  return {
    ok: true,
    situation: situation.trim(),
    action_considered: action_considered.trim(),
    virtue_engaged: virtue_engaged as Virtue,
    complete_expression: complete_expression.trim(),
    distance: distance.trim(),
    distance_reading: reading,
  }
}

/**
 * The R20a subject for this route — every practitioner-authored field, RAW.
 *
 * ⚠ KEEP IN SYNC with parseCompassContent's field list.
 *
 * ⚠ `distance` IS INCLUDED, AND THAT IS NOT A VIOLATION OF THE #14 CONSTRAINT.
 * Read this before "fixing" it.
 *
 * The binding mentor constraint on this tool is that the distance "is NOT A
 * VERDICT — it is a developmental orientation": nothing may score, rank, grade
 * or classify it as a measure of the practitioner's quality. That is why
 * `distance` is deliberately absent from classifyExpression's arguments and
 * from its cache key, pinned at both call sites by the boundary test.
 *
 * A distress screen is a categorically different operation. It does not rate
 * the distance, does not feed the quality gate, does not reach the stored row,
 * and produces no developmental judgement of any kind — it asks only whether
 * the person writing is in crisis, and it asks that of EVERY field they wrote.
 * Excluding `distance` would mean a practitioner who names the gap as something
 * unbearable writes it into the one field nothing looks at.
 *
 * `distance_reading` is excluded instead: it is the controlled far/some_way/
 * close enum, carrying no prose.
 */
function compassDistressSubject(body: unknown): string {
  const b = (body ?? {}) as Record<string, unknown>
  return composeDistressSubject([
    b.situation,
    b.action_considered,
    b.complete_expression,
    b.distance,
  ])
}

/**
 * Read + shape the JSON request body. A non-JSON payload, or a body that is not a
 * plain object (null / array / primitive), is a client error → the caller returns
 * 400, rather than falling through to a generic 500.
 */
async function readJsonBody(
  request: NextRequest
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false }> {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false }
    return { ok: true, body: body as Record<string, unknown> }
  } catch {
    return { ok: false }
  }
}

/**
 * The tailored quality-gate message — authored deterministically (NOT by the LLM),
 * keyed off the classification of the COMPLETE EXPRESSION.
 *
 * Note what this does and does not say: it speaks ONLY to whether the sage's
 * complete expression is anchored to this situation. It passes no judgement on the
 * distance — a large distance honestly named is exactly what the exercise is for.
 */
function expressionBlock(quality: ExpressionQuality) {
  const concrete = quality === 'concrete'
  const message = concrete
    ? 'The bearing is set. This is a concrete expression of what complete virtue would do in this situation — something you can steer by, not merely admire. The distance you named is the developmental orientation, not a verdict: the direction of travel is visible even when the destination is far.'
    : 'This reads as a general ideal rather than a compass bearing. The sage-compass is not "be wise" or "act with integrity" — it is what complete understanding of this virtue would actually PRODUCE in THIS situation: the specific thing it would do, say, or refuse. Anchor it to the situation and the action you named, then set it again. (Nothing is being judged about the distance — a long way to go is an honest reading, not a failure.)'
  return { expression_quality: quality, concrete, message }
}

/**
 * POST /api/mentor/sage-compass
 *
 * The sage-compass — Remaining Principles #14. The Stoic practice of asking, before
 * a difficult decision, "what would the sage do?" The mentor is emphatic that this
 * is not a vague aspiration but a STRUCTURED imaginative exercise: identify the
 * virtue the situation engages, identify what complete and unified virtue would
 * produce in that domain, and use it as the ORIENTATION for the current action.
 * "The exercise is not claiming to be the sage. It is using the sage as a compass
 * bearing."
 *
 * Body:
 *   situation           (required) — the difficult decision before you
 *   action_considered   (required) — the action you are considering
 *   virtue_engaged      (required) — wisdom | justice | courage | temperance
 *   complete_expression (required) — what that virtue's complete expression would look like here
 *   distance            (required) — the distance between that expression and the action
 *   distance_reading    (optional) — far | some_way | close (practitioner-selected)
 *
 * *** THE BINDING CONSTRAINT (mentor #14). *** "The distance is NOT A VERDICT. It is
 * a developmental orientation." Nothing here scores, ranks, grades, or classifies
 * the distance; `distance` is never sent to the classifier, and `distance_reading`
 * is the practitioner's own selection, recorded verbatim. The single gate
 * classifies ONLY the complete_expression's concreteness.
 *
 * The mentor's framing of the compass as "the positive complement to the passion
 * diagnosis" is rendered as page prose — deliberately NOT a code coupling to the
 * passion-diagnosis table.
 *
 * Human-only. Never touches /api/reason, the signed assessment, or the substrate
 * engine, and never imports the reflect engine or proximity-domains.
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  // ── R20a perimeter (AC5; added 2026-08-18, practice-family closure) ────────
  // RULED IN 2026-08-17. Before parseCompassContent, before classifyExpression's
  // LLM call, before the insert. Flag-off is byte-identical.
  let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
  if (isR20aGapClosureEnabled()) {
    const gate = await enforceDistressCheck(
      detectDistressTwoStage(compassDistressSubject(parsedBody.body))
    )
    if (gate.result.distress_detected && gate.result.severity !== 'mild') {
      return NextResponse.json({
        distress_detected: true,
        severity: gate.result.severity,
        redirect_message: gate.result.redirect_message,
      })
    }
    if (gate.result.severity === 'mild') {
      mildSupport = buildMildSupportResources('practice')
    }
  }

  try {
    const parsed = parseCompassContent(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    // NOTE the arguments: the situation, the action, the virtue, and the expression.
    // The DISTANCE is deliberately NOT passed — it is never classified.
    const quality = await classifyExpression(
      parsed.situation,
      parsed.action_considered,
      parsed.virtue_engaged,
      parsed.complete_expression
    )

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('sage_compass_entries')
      .insert({
        user_id: userId,
        situation: parsed.situation,
        action_considered: parsed.action_considered,
        virtue_engaged: parsed.virtue_engaged,
        complete_expression: parsed.complete_expression,
        distance: parsed.distance,
        distance_reading: parsed.distance_reading,
        expression_quality: quality,
      })
      .select()
      .single()

    if (error) {
      console.error('Sage compass insert error:', error)
      return NextResponse.json({ error: 'Failed to save sage-compass entry' }, { status: 500 })
    }

    // Phase 2 (the in-session trigger, Step M rows 11+12): a pure LOOKUP over
    // the stored values — the distance is never classified (the #14 constraint
    // stands untouched; the far row keys on the practitioner's own SELECTED
    // reading and reflects it back as their marking).
    const suggested = resolveSageCompass({
      expressionQuality: quality,
      distanceReading: parsed.distance_reading,
      virtueEngaged: parsed.virtue_engaged,
    })

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: expressionBlock(quality),
      ...(suggested ? { suggested_practice: suggested } : {}),
      ...(mildSupport ? { support_resources: mildSupport } : {}),
    })
  } catch (err) {
    console.error('Sage compass API error:', err)
    logRouteError({ route: '/api/mentor/sage-compass', method: 'POST', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mentor/sage-compass
 *
 * Revise an existing sage-compass entry in place (used to sharpen an expression the
 * gate flagged as a general ideal, without re-entering everything or creating a
 * duplicate). Re-validates the same fields and re-runs the expression gate.
 * Scoped to the authenticated user (matched on BOTH id AND user_id).
 * Body: { id, ...content }.
 */
export async function PATCH(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  // ── R20a perimeter (AC5; added 2026-08-18) — BOTH write paths ─────────────
  // A revision carries the same free text. Before the id checks and before the
  // classification call.
  let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
  if (isR20aGapClosureEnabled()) {
    const gate = await enforceDistressCheck(
      detectDistressTwoStage(compassDistressSubject(parsedBody.body))
    )
    if (gate.result.distress_detected && gate.result.severity !== 'mild') {
      return NextResponse.json({
        distress_detected: true,
        severity: gate.result.severity,
        redirect_message: gate.result.redirect_message,
      })
    }
    if (gate.result.severity === 'mild') {
      mildSupport = buildMildSupportResources('practice')
    }
  }

  const id = typeof parsedBody.body.id === 'string' ? parsedBody.body.id : ''
  if (!id) {
    return NextResponse.json({ error: 'Entry id is required' }, { status: 400 })
  }
  // id is a uuid PRIMARY KEY (migration). Reject a malformed id here — before the
  // classification call below — rather than let Postgres reject it as 22P02 and
  // surface a generic 500 for what is actually a 400-grade client error.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Entry id must be a valid uuid' }, { status: 400 })
  }

  try {
    const parsed = parseCompassContent(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const quality = await classifyExpression(
      parsed.situation,
      parsed.action_considered,
      parsed.virtue_engaged,
      parsed.complete_expression
    )

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('sage_compass_entries')
      .update({
        situation: parsed.situation,
        action_considered: parsed.action_considered,
        virtue_engaged: parsed.virtue_engaged,
        complete_expression: parsed.complete_expression,
        distance: parsed.distance,
        distance_reading: parsed.distance_reading,
        expression_quality: quality,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Sage compass update error:', error)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }
    // No row matched the (id, user_id) scope — the entry does not exist or is not
    // the caller's. Honest 404, not a misleading 500. The .eq('user_id') scope
    // guarantees no cross-user row is ever touched.
    if (!data) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Phase 2: a revision is a save — the suggestion recomputes with the gate.
    const suggested = resolveSageCompass({
      expressionQuality: quality,
      distanceReading: parsed.distance_reading,
      virtueEngaged: parsed.virtue_engaged,
    })

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: expressionBlock(quality),
      ...(suggested ? { suggested_practice: suggested } : {}),
      ...(mildSupport ? { support_resources: mildSupport } : {}),
    })
  } catch (err) {
    console.error('Sage compass PATCH error:', err)
    logRouteError({ route: '/api/mentor/sage-compass', method: 'PATCH', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/sage-compass?view=feed&limit=50
 *
 * Retrieve the user's sage-compass entries (most recent first).
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
    .from('sage_compass_entries')
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
 * Quality gate: uses an LLM to CLASSIFY the COMPLETE EXPRESSION — nothing more. It
 * returns one of 'concrete' | 'vague'. The LLM authors no message and no Stoic
 * commentary; the tailored message is produced by the deterministic
 * expressionBlock() above, keyed off this classification.
 *
 *   concrete — the expression names what complete virtue would actually PRODUCE in
 *              this situation: a specific thing it would do, say, or refuse.
 *   vague    — a general ideal or platitude ("act with integrity", "be wise",
 *              "do the right thing") that is not anchored to this situation.
 *
 * *** SCOPE (mentor #14, binding). *** The DISTANCE is deliberately NOT a parameter
 * of this function and is never sent to the model. The distance is not a verdict and
 * is never scored, ranked, or graded — by this gate or anything else. This gate
 * exists only to honour the mentor's other constraint: that the exercise is "not a
 * vague aspiration" but "a structured imaginative exercise".
 *
 * Fails OPEN (returns 'concrete') so a gate outage never blocks a genuine entry.
 */
async function classifyExpression(
  situation: string,
  actionConsidered: string,
  virtue: Virtue,
  completeExpression: string
): Promise<ExpressionQuality> {
  try {
    const ck = cacheKey('/api/mentor/sage-compass/expression-gate', {
      situation: situation.trim(),
      action_considered: actionConsidered.trim(),
      virtue_engaged: virtue,
      complete_expression: completeExpression.trim(),
    })
    const cached = cacheGet(ck) as { expression: ExpressionQuality } | undefined
    if (cached !== undefined) return cached.expression

    const client = getClient()

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 128,
      system: `You are a classifier for a Stoic "sage-compass" exercise. Before a difficult decision, a practitioner names the SITUATION, the ACTION they are considering, the VIRTUE primarily engaged, and — the field you are classifying — what that virtue's COMPLETE EXPRESSION would look like in this situation (what a perfectly wise person would actually do here). This is used as a compass bearing, not as a claim to be the sage.

Classify ONLY whether the COMPLETE EXPRESSION is concrete and situation-anchored, or a vague general ideal. Do not add commentary or advice. Do not evaluate the practitioner, the action, or how far short of the expression the action falls — that is explicitly none of your concern.

"concrete": the expression names what complete virtue would actually produce in THIS situation — a specific thing it would do, say, refuse, or attend to (e.g. "tell the client the estimate was wrong today, absorb the cost, and not shade the explanation to protect my reputation").

"vague": the expression is a general ideal or platitude not anchored to this situation (e.g. "act with integrity", "be wise", "do the right thing", "handle it virtuously").

Respond ONLY with: {"expression": "concrete"} or {"expression": "vague"}`,
      messages: [
        {
          role: 'user',
          content: `Situation: ${situation.trim()}
Action being considered: ${actionConsidered.trim()}
Virtue primarily engaged: ${virtue}
Complete expression of that virtue: ${completeExpression.trim()}

Classify the complete expression.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return 'concrete' // fail open

    const result = JSON.parse(jsonMatch[0])
    const expression: ExpressionQuality = result.expression === 'vague' ? 'vague' : 'concrete'
    cacheSet(ck, { expression })
    return expression
  } catch (err) {
    console.error('Sage compass expression gate failed:', err)
    logRouteError({
      route: '/api/mentor/sage-compass',
      method: 'POST',
      error: err,
      statusCode: 200,
      isLlmOutage: isLlmOutage(err),
      context: { gate: 'expression-gate', fail_open: true },
    })
    // Fail open — don't block the entry if the gate itself fails
    return 'concrete'
  }
}
