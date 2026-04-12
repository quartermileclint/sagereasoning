import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'

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
      return NextResponse.json({ ...cached, cached: true })
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

    return NextResponse.json({
      ...classification,
      cached: false,
      latency_ms: latencyMs,
    })
  } catch (err) {
    console.error('Passion classify API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
