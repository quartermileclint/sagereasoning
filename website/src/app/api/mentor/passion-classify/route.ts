import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { enforceDistressCheck } from '@/lib/constraints'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import {
  isR20aGapClosureEnabled,
  composeDistressSubject,
  buildMildSupportResources,
  hasScreenableSubject,
} from '@/lib/r20a-gap-closure'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { isLlmOutage, llmOutageResponse } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import {
  PATTERN_CONSECUTIVE_MISSES,
  resolvePassionClassification,
  type SuggestedPractice,
} from '@/lib/practice-sequence'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/mentor/passion-classify
 *
 * LLM classification endpoint for passion events.
 * Input: { description, user_diagnosis, event_id? }
 * Output: { classified_type, confidence, match, reasoning }
 *
 * Uses MODEL_FAST (haiku) — classification task, not deep reasoning.
 * If event_id is provided, updates the passion_events record with classification results.
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
    const { description, user_diagnosis, event_id } = body

    // ── R20a perimeter (AC5; added 2026-08-17, gap closure) ─────────────────
    // This route was OUTSIDE the perimeter and accepted practitioner free text
    // about their own fear, anger, grief and shame with no distress check at
    // all. Inside on the mentor's B3 ground (see r20a-gap-closure.ts).
    //
    // Runs BEFORE the route's own field validation, so distress in an
    // otherwise-invalid body still catches, and BEFORE any cache read or LLM
    // call. Flag-off is byte-identical.
    let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
    if (isR20aGapClosureEnabled()) {
      const subject = composeDistressSubject([description, user_diagnosis])
      // PR19 (2026-08-18 fold, extended 2026-08-22): skip the classifier on an
      // empty subject — missing/empty fields have no distress to detect, and
      // calling it anyway pays for a real billed Haiku call before the
      // required-fields 400 below fires.
      if (hasScreenableSubject(subject)) {
        const gate = await enforceDistressCheck(detectDistressTwoStage(subject))
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
    }

    if (!description?.trim() || !user_diagnosis?.trim()) {
      return NextResponse.json(
        { error: 'Required fields: description, user_diagnosis' },
        { status: 400 }
      )
    }

    const descErr = validateTextLength(description, 'Description', TEXT_LIMITS.medium)
    if (descErr) return NextResponse.json({ error: descErr }, { status: 400 })

    // Check cache
    const ck = cacheKey('/api/mentor/passion-classify', {
      description: description.trim(),
      user_diagnosis: user_diagnosis.trim(),
    })
    const cached = cacheGet(ck) as { classified_type: string; confidence: number; match: boolean; reasoning: string } | undefined
    if (cached) {
      // If event_id provided, still update the record
      if (event_id) {
        await updatePassionEventClassification(userId, event_id, cached)
      }
      // The suggestion is computed FRESH per event, never cached — the cache
      // key is (description, user_diagnosis), which is not user- or
      // event-specific, while the pattern row reads this user's history.
      const suggested = event_id ? await computeSuggestedPractice(userId, event_id, cached.classified_type) : null
      return NextResponse.json({ ...cached, cached: true, ...(suggested ? { suggested_practice: suggested } : {}), ...(mildSupport ? { support_resources: mildSupport } : {}) })
    }

    // Load Stoic passion context for the classifier
    const passionContext = getStoicBrainContext('quick')

    const client = getClient()
    const startTime = Date.now()

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 1024,
      system: `You are a Stoic passion classifier. Given a description of an emotional event, classify it according to the Stoic taxonomy of passions.

${passionContext}

PASSION TAXONOMY:
Epithumia family (irrational desire): philodoxia (love of honour/reputation), orge (anger), pothos (longing), philedonia (love of pleasure), philoplousia (love of wealth), eros (erotic love)
Phobos family (irrational fear): agonia (anxiety about future), oknos (hesitation/avoidance), aischyne (shame about opinion), deima (terror), thambos (amazement/shock), thorybos (inner turmoil)
Lupe family (irrational grief): penthos (grief/sorrow), phthonos (envy), zelotypia (jealousy), eleos (pity), achos (distress)
Hedone family (irrational pleasure): kelesis (enchantment), epichairekakia (malicious joy), terpsis (delight in wrong)

Respond ONLY with valid JSON in this exact format:
{
  "classified_type": "<passion_type from taxonomy>",
  "confidence": <0.0 to 1.0>,
  "match": <true if classified_type matches user_diagnosis, false otherwise>,
  "reasoning": "<1-2 sentences explaining the classification>"
}`,
      messages: [
        {
          role: 'user',
          content: `Event description: ${description.trim()}

User's self-diagnosis: ${user_diagnosis.trim()}

Classify this passion event.`,
        },
      ],
    })

    const latencyMs = Date.now() - startTime
    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response
    let classification: { classified_type: string; confidence: number; match: boolean; reasoning: string }
    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      classification = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      console.error('Classification parse error:', parseErr, 'Response:', responseText)
      return NextResponse.json(
        { error: 'Classification failed — could not parse LLM response' },
        { status: 502 }
      )
    }

    // Cache the result
    cacheSet(ck, classification)

    // If event_id provided, update the passion_events record
    if (event_id) {
      await updatePassionEventClassification(userId, event_id, classification)
    }

    // Phase 2 (the in-session trigger, Step M 6b): the ENGINE's reading drives
    // the suggestion, so THIS response — where the engine's reading first
    // exists — carries the full resolution (sub-species row first, the pattern
    // row only when the entry-specific resolution yields nothing). The client
    // replaces the save response's pattern-only suggestion with this one.
    const suggested = event_id ? await computeSuggestedPractice(userId, event_id, classification.classified_type) : null

    return NextResponse.json({
      ...classification,
      cached: false,
      latency_ms: latencyMs,
      ...(suggested ? { suggested_practice: suggested } : {}),
      ...(mildSupport ? { support_resources: mildSupport } : {}),
    })
  } catch (err) {
    console.error('Passion classify API error:', err)
    const outage = isLlmOutage(err)
    logRouteError({
      route: '/api/mentor/passion-classify',
      method: 'POST',
      error: err,
      statusCode: outage ? 503 : 500,
      isLlmOutage: outage,
    })
    if (outage) return llmOutageResponse()
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Phase 2 (the in-session trigger): resolve the suggestion for a just-saved,
 * just-classified passion event, per the locked mapping in practice-sequence.
 *
 * The practitioner's reading is taken from the STORED row (the record, not the
 * request echo); agreement is decided inside the resolver by deterministic id
 * equality — the classifier's own `match` claim is never an input. Anchored to
 * a persisted event only: without an event there is no entry for the
 * suggestion to answer.
 *
 * Fail-soft toward silence: any read failure returns null. A suggestion is an
 * affordance; its honest null is absence.
 */
async function computeSuggestedPractice(
  userId: string,
  eventId: string,
  classifiedType: string
): Promise<SuggestedPractice | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: event } = await supabase
      .from('passion_events')
      .select('passion_type, caught_before_assent, created_at')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single()
    if (!event) return null
    const { data: prior } = await supabase
      .from('passion_events')
      .select('caught_before_assent')
      .eq('user_id', userId)
      .neq('id', eventId)
      .lt('created_at', event.created_at)
      .order('created_at', { ascending: false })
      .limit(PATTERN_CONSECUTIVE_MISSES - 1)
    return resolvePassionClassification({
      practitionerReading: event.passion_type,
      engineReading: classifiedType,
      recentCaughtBeforeAssent: [
        event.caught_before_assent as boolean,
        // Raw pass-through: a null/unknown stored value breaks the pattern
        // (fails toward silence) rather than being coerced into a miss.
        ...(prior ?? []).map((r) => r.caught_before_assent as boolean),
      ],
    })
  } catch {
    return null
  }
}

/**
 * Update a passion_events record with LLM classification results.
 */
async function updatePassionEventClassification(
  userId: string,
  eventId: string,
  classification: { classified_type: string; confidence: number; match: boolean }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    await supabase
      .from('passion_events')
      .update({
        llm_classified_type: classification.classified_type,
        llm_confidence: classification.confidence,
        classification_match: classification.match,
      })
      .eq('id', eventId)
      .eq('user_id', userId) // RLS safety: only update own events
  } catch (err) {
    console.error('Failed to update passion event classification:', err)
    // Non-fatal — classification result still returned to client
  }
}
