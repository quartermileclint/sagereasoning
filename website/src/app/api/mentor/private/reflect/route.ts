import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { getStoicBrainContextForMechanisms } from '@/lib/context/stoic-brain-loader'
import { getFullPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { getMentorKnowledgeBase } from '@/lib/context/mentor-knowledge-base-loader'
import { getMentorObservationsWithParallelLog, getJournalReferences, getProfileSnapshots } from '@/lib/context/mentor-context-private'
import { extractJSON } from '@/lib/json-utils'
import { logMentorObservation, validateMentorObservation } from '@/lib/logging/mentor-observation-logger'
import type { ObservationCategory, ConfidenceLevel } from '@/lib/logging/mentor-observation-logger'

// =============================================================================
// PRIVATE mentor reflect — Founder-only daily reflection
//
// POST /api/mentor/private/reflect
//
// Same reflection logic as the public /api/reflect, but with richer context:
//   - Full practitioner profile (not the condensed ~300-500 token version)
//   - L2 Project Context (development phase, recent decisions)
//   - L5 Mentor Knowledge Base (Stoic historical context, global state)
//
// Access: Founder only (FOUNDER_USER_ID env var)
// =============================================================================

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const REFLECTION_PROMPT = `You are the Stoic Sage reflection companion for sagereasoning.com. A user is reflecting on their day — what happened and how they responded. Your role is to evaluate their alignment with right reason (katorthoma), identify what they did well, and show what a Stoic sage would have done differently.

Use 4-stage evaluation to assess their reflection:

STAGE 1: Is the action aligned with right reason at all?
- Reflexive (reactive, unconsidered): Acts from habit or impulse without examination
- Habitual (customary): Follows patterns, social norms, or established practices
- Deliberate (considered): Thinks through the action, questions assumptions, chooses consciously
- Principled (reasoned): Acts from explicit understanding of virtue and alignment with nature
- Sage-like (exemplary): Demonstrates wisdom, justice, courage, and temperance integrated

STAGE 2: Identify any passions detected
For each significant emotional response in their reflection, extract:
- root_passion: The primary emotion (e.g., anger, fear, desire, aversion, shame)
- sub_species: The specific manifestation (e.g., indignation, anxiety, ambition, revulsion, embarrassment)
- false_judgement: The underlying false belief (what false impression about good/bad did they hold?)

STAGE 3: What did they do well?
Identify specific actions or virtues they expressed.

STAGE 4: Sage perspective
What would right reason (katorthoma) suggest differently, if anything? Be specific to their situation.

Be warm but honest. The user is here to grow, not to be flattered.

Return ONLY valid JSON:
{
  "katorthoma_proximity": "<reflexive|habitual|deliberate|principled|sage_like>",
  "passions_detected": [
    {
      "root_passion": "<anger|fear|desire|aversion|shame|other>",
      "sub_species": "<specific manifestation>",
      "false_judgement": "<the false belief underlying this passion>"
    }
  ],
  "what_you_did_well": "<1-2 sentences: specific virtues or actions the user expressed today>",
  "sage_perspective": "<2-3 sentences: what right reason (katorthoma) would suggest, if anything. Be specific to their situation. If they acted well, affirm it.>",
  "evening_prompt": "<1 sentence: a reflective question for the user to sit with tonight, drawn from their specific situation>",
  "structured_observation": {
    "observation": "<50-500 chars, third-person about the practitioner. Focus on what this reflection reveals about their developmental trajectory. Write about the practitioner, NOT to them. Good: 'Founder consistently avoids naming fear as a passion — possible andreia blind spot.' Bad: 'I noticed you seem afraid.' Bad: 'You should work on courage.'",
    "category": "<passion_event|virtue_marker|reasoning_pattern|progress_signal|oikeiosis_shift|integration_signal>",
    "confidence": "<low|medium|high>"
  },
  "disclaimer": "This reflection is guidance, not judgment. Only you know the full context of your choices. Stoic practice is about sustained effort toward virtue, not perfection."
}`

// POST — Submit a daily reflection (private, founder-only)
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // Founder-only gate
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'This endpoint is restricted to the private mentor.' },
      { status: 403 }
    )
  }

  try {
    const startTime = Date.now()
    const { what_happened, how_i_responded, user_id } = await request.json()

    const textLengthError = validateTextLength(what_happened, 'what_happened', TEXT_LIMITS.medium)
    if (textLengthError) {
      return NextResponse.json({ error: textLengthError }, { status: 400 })
    }

    if (how_i_responded) {
      const responseError = validateTextLength(how_i_responded, 'how_i_responded', TEXT_LIMITS.medium)
      if (responseError) {
        return NextResponse.json({ error: responseError }, { status: 400 })
      }
    }

    if (!what_happened || typeof what_happened !== 'string' || what_happened.trim().length < 10) {
      return NextResponse.json(
        { error: 'what_happened is required (describe what happened today, min 10 characters)' },
        { status: 400 }
      )
    }

    // Context layers — private mentor gets full profile + project context + L5
    // Plus growth accumulation context: observations, journal refs, snapshots
    const stoicBrainContext = getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis'])
    const [
      fullPractitionerContext,
      projectContext,
      mentorObservations,
      journalRefs,
      profileSnapshots,
    ] = await Promise.all([
      getFullPractitionerContext(auth.user.id),
      getProjectContext('minimal'),
      getMentorObservationsWithParallelLog(auth.user.id, 'private-mentor', 'private-reflect'),
      getJournalReferences(auth.user.id, extractTopicHints(what_happened, how_i_responded), 'private-mentor'),
      getProfileSnapshots(auth.user.id, 'private-mentor'),
    ])
    const mentorKnowledgeBase = getMentorKnowledgeBase()

    let userMessage = `Daily reflection:

What happened: ${what_happened.trim()}
${how_i_responded?.trim() ? `How I responded: ${how_i_responded.trim()}` : ''}

Score my actions and give me the sage perspective.`

    if (fullPractitionerContext) userMessage += `\n\n${fullPractitionerContext}`
    if (mentorObservations) userMessage += `\n\n${mentorObservations}`
    if (journalRefs) userMessage += `\n\n${journalRefs}`
    if (profileSnapshots) userMessage += `\n\n${profileSnapshots}`
    userMessage += `\n\n${projectContext}`
    userMessage += `\n\n${mentorKnowledgeBase}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.3,
      system: [
        { type: 'text', text: REFLECTION_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: stoicBrainContext },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let reflectionData: Record<string, any>
    try {
      reflectionData = extractJSON(responseText) as Record<string, any>
    } catch (parseErr) {
      console.error('Private reflect parse error. Raw response:', responseText)
      console.error('Parse error:', parseErr)
      return NextResponse.json(
        { error: 'Reflection engine returned invalid response' },
        { status: 500 }
      )
    }

    // Validate katorthoma_proximity is a valid level
    const validLevels: KatorthomaProximityLevel[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
    if (!validLevels.includes(reflectionData.katorthoma_proximity)) {
      console.error('Invalid katorthoma_proximity:', reflectionData.katorthoma_proximity)
      return NextResponse.json(
        { error: 'Reflection engine returned invalid proximity level' },
        { status: 500 }
      )
    }

    // Save reflection
    const effectiveUserId = user_id || auth.user.id
    await supabaseAdmin
      .from('reflections')
      .insert({
        user_id: effectiveUserId,
        what_happened: what_happened.trim(),
        how_responded: how_i_responded?.trim() || null,
        katorthoma_proximity: reflectionData.katorthoma_proximity,
        passions_detected: reflectionData.passions_detected || [],
        sage_perspective: reflectionData.sage_perspective,
        evening_prompt: reflectionData.evening_prompt,
      })
      .then(() => {})

    // Generate reasoning receipt
    const receipt = extractReceipt({
      skillId: 'sage-reflect',
      input: what_happened.trim(),
      evalData: {
        katorthoma_proximity: reflectionData.katorthoma_proximity,
        passions_detected: reflectionData.passions_detected,
        sage_perspective: reflectionData.sage_perspective,
      },
      mechanisms: ['passion_diagnosis', 'oikeiosis'],
    })

    // Extract structured observation text for the API response
    // The LLM returns structured_observation { observation, category, confidence }
    // We surface the observation text to the frontend, and log the structured version to the pipeline
    const structuredObs = reflectionData.structured_observation as {
      observation?: string
      category?: string
      confidence?: string
    } | null

    const result = {
      katorthoma_proximity: reflectionData.katorthoma_proximity,
      passions_detected: reflectionData.passions_detected || [],
      what_you_did_well: reflectionData.what_you_did_well,
      sage_perspective: reflectionData.sage_perspective,
      mentor_observation: structuredObs?.observation || null,
      evening_prompt: reflectionData.evening_prompt,
      reasoning_receipt: receipt,
      disclaimer: reflectionData.disclaimer,
      reflected_at: new Date().toISOString(),
      mentor_mode: 'private',
    }

    // Log structured observation to the unified pipeline (mentor_observations_structured)
    // This is the primary caller for logMentorObservation() — the data quality gate.
    let obsLogStatus = 'not_attempted'
    let obsLogDetail = ''

    if (structuredObs?.observation && structuredObs?.category && structuredObs?.confidence) {
      try {
        const { data: profileRow } = await supabaseAdmin
          .from('mentor_profiles')
          .select('id')
          .eq('user_id', effectiveUserId)
          .single()

        if (profileRow) {
          obsLogStatus = 'profile_found'
          const obsResult = await logMentorObservation(
            (profileRow as { id: string }).id,
            {
              date: new Date().toISOString().split('T')[0],
              observation: structuredObs.observation,
              category: structuredObs.category as ObservationCategory,
              confidence: structuredObs.confidence as ConfidenceLevel,
              source_context: 'evening_reflection',
            }
          )
          if (obsResult.success) {
            obsLogStatus = 'logged'
          } else {
            obsLogStatus = 'validation_rejected'
            obsLogDetail = obsResult.error || 'unknown'
            console.warn('[private/reflect] Structured observation rejected:', obsResult.error)
          }
        } else {
          obsLogStatus = 'no_profile'
          obsLogDetail = 'mentor_profiles query returned no row for user'
          console.warn('[private/reflect] No mentor profile found for user:', effectiveUserId)
        }
      } catch (obsErr) {
        obsLogStatus = 'exception'
        obsLogDetail = String(obsErr)
        console.warn('[private/reflect] Failed to log structured observation (non-blocking):', obsErr)
      }
    } else {
      obsLogStatus = 'llm_missing_field'
      obsLogDetail = JSON.stringify({
        has_observation: !!structuredObs?.observation,
        has_category: !!structuredObs?.category,
        has_confidence: !!structuredObs?.confidence,
        raw_type: typeof reflectionData.structured_observation,
        raw_value: reflectionData.structured_observation
          ? JSON.stringify(reflectionData.structured_observation).substring(0, 200)
          : 'undefined',
      })
      console.warn('[private/reflect] Structured observation not extracted from LLM response:', obsLogDetail)
    }

    // Analytics — now includes detailed diagnostic for observation pipeline
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'daily_reflection',
        user_id: effectiveUserId,
        metadata: {
          katorthoma_proximity: reflectionData.katorthoma_proximity,
          passions_count: (reflectionData.passions_detected || []).length,
          mentor_mode: 'private',
          structured_observation_logged: obsLogStatus === 'logged',
          obs_log_status: obsLogStatus,
          obs_log_detail: obsLogDetail || undefined,
        },
      })
      .then(() => {})

    // Self-improving feedback loop — feed reflection into Mentor profile
    // Awaited (not fire-and-forget) to ensure writes complete before Vercel terminates the function
    try {
      const { updateProfileFromReflection } = await import('../../../../../../../sage-mentor/profile-store')
      await updateProfileFromReflection(
        supabaseAdmin as any,
        effectiveUserId,
        {
          katorthoma_proximity: reflectionData.katorthoma_proximity,
          passions_detected: reflectionData.passions_detected || [],
          what_you_did_well: reflectionData.what_you_did_well,
          sage_perspective: reflectionData.sage_perspective,
        },
        what_happened.trim(),
        'private-mentor'
      )
    } catch (err) {
      console.error('Private reflect → profile update failed (non-blocking):', err)
    }

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/mentor/private/reflect',
      model: 'claude-sonnet-4-6',
      startTime,
      maxTokens: 1024,
      composability: {
        next_steps: ['/api/mentor/private/reflect', '/api/score'],
        recommended_action: 'Reflection findings fed back into Mentor profile (passion map, rolling window). The next interaction benefits from this reflection.',
      },
    })

    return NextResponse.json(envelope, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Private reflect API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Extract simple topic hints from the reflection input for journal reference matching.
 * These are used to query the journal_refs table for relevant passages.
 * Lightweight keyword extraction — not NLP, just common Stoic practice terms.
 */
function extractTopicHints(whatHappened: string, howResponded?: string): string[] {
  const text = `${whatHappened} ${howResponded || ''}`.toLowerCase()
  const stoicKeywords = [
    'anger', 'fear', 'desire', 'shame', 'grief', 'anxiety', 'frustration',
    'courage', 'justice', 'wisdom', 'temperance', 'virtue',
    'judgement', 'impression', 'assent', 'impulse',
    'family', 'work', 'relationship', 'community', 'conflict',
    'decision', 'avoidance', 'control', 'acceptance',
  ]
  return stoicKeywords.filter(kw => text.includes(kw))
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
