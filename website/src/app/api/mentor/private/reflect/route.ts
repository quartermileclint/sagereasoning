import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { buildEnvelope } from '@/lib/response-envelope'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { getStoicBrainContextForMechanisms } from '@/lib/context/stoic-brain-loader'
import { getFullPractitionerContext, getProjectedPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { getMentorKnowledgeBase } from '@/lib/context/mentor-knowledge-base-loader'
import {
  getMentorObservationsWithParallelLog,
  getJournalReferences,
  getProfileSnapshots,
  getRecentInteractionsAsSignals,
  getBaselineAppendixContext,
  recordSessionContextSnapshot,
  fnv1aHash,
  estimateTokens,
} from '@/lib/context/mentor-context-private'
// ADR-Ring-2-01 Session 4 (4a) — 26 April 2026:
// Migrated to the canonical loader (then named loadMentorProfileCanonical;
// renamed to loadMentorProfile at Session 5 close, 26 April 2026, when the
// legacy loader was retired). This was the last legacy read-side caller in
// /website/src/. The loaded profile flows only into
// getRecentInteractionsAsSignals at line ~210 (no direct field access in
// this route handler; response body returns no profile-derived fields —
// audit-confirmed). AC5/R20a perimeter unchanged: the
// `await enforceDistressCheck(detectDistressTwoStage(...))` pattern below
// at line ~141 is untouched. AC7 not engaged (no auth/cookie/session/redirect
// changes). After Session 4c (`ProfileForSignals` retirement), only
// canonical reaches getRecentInteractionsAsSignals.
import { loadMentorProfile } from '@/lib/mentor-profile-store'
import { extractJSON } from '@/lib/json-utils'
import { logMentorObservation } from '@/lib/logging/mentor-observation-logger'
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

// R1 extension (19 April 2026): hub label is architecturally fixed for this
// endpoint (private mentor only). Named constant surfaces the hardcode for
// future taxonomy refactors. See KG8 in operations/knowledge-gaps.md.
const PRIVATE_MENTOR_HUB = 'private-mentor' as const

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
    "observation": "<STRICT: 50-250 chars. Third-person about the practitioner. One core developmental signal only. Example: 'Practitioner interrupted passion at synkatathesis stage for the first time — upstream shift from post-hoc diagnosis to pre-emptive regulation.'>",
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

    // R20a — Vulnerable user detection (before any LLM call or structured observation extraction)
    // This MUST run at pipeline entry. Distress detection takes priority over all evaluation logic.
    // The graceful degradation path (JSON parse failure) must NOT suppress a distress flag —
    // distress is caught here before the LLM is ever called.
    const combinedInput = `${what_happened} ${how_i_responded || ''}`
    const gate = await enforceDistressCheck(detectDistressTwoStage(combinedInput))
    if (gate.shouldRedirect) {
      // Log the distress detection for safety monitoring (no reflection data stored)
      const { error: distressLogError } = await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'distress_detected',
          user_id: auth.user.id,
          metadata: {
            severity: gate.result.severity,
            indicators: gate.result.indicators_found,
            mentor_mode: 'private',
            endpoint: '/api/mentor/private/reflect',
          },
        })
      if (distressLogError) {
        console.error('[private/reflect] distress analytics insert failed:', distressLogError)
      }

      return NextResponse.json(
        {
          distress_detected: true,
          severity: gate.result.severity,
          redirect_message: gate.result.redirect_message,
        },
        { status: 200, headers: corsHeaders() }
      )
    }

    // Context layers — private mentor gets profile + project context + L5
    // Plus growth accumulation context: observations, journal refs, snapshots
    //
    // Session Context Loader feature flag (MENTOR_CONTEXT_V2):
    //   - true  → topic-projected profile + recent interaction signals (Piece 1 + 2)
    //   - false → legacy full profile load (rollback path)
    // Elevated risk change — this modifies what goes to the LLM on every request.
    const useProjection = process.env.MENTOR_CONTEXT_V2 === 'true'
    const topicForProjection = `${what_happened} ${how_i_responded || ''}`.trim()

    const stoicBrainContext = getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis'])

    // Profile load varies by flag. When projection is on, we also load the
    // raw profile once so the recent-interaction signals can match passions.
    const [
      projectedProfileContext,
      legacyProfileContext,
      storedProfile,
      projectContext,
      mentorObservations,
      journalRefs,
      profileSnapshots,
      baselineAppendixContext,
    ] = await Promise.all([
      useProjection ? getProjectedPractitionerContext(auth.user.id, topicForProjection) : Promise.resolve(null),
      useProjection ? Promise.resolve(null) : getFullPractitionerContext(auth.user.id),
      // ADR-Ring-2-01 Session 4 (4a): canonical loader. storedProfile.profile
      // is now MentorProfile (not MentorProfileData). The result flows only to
      // getRecentInteractionsAsSignals (still accepts ProfileForSignals until 4c).
      useProjection ? loadMentorProfile(auth.user.id) : Promise.resolve(null),
      getProjectContext('minimal'),
      getMentorObservationsWithParallelLog(auth.user.id, PRIVATE_MENTOR_HUB, 'private-reflect'),
      getJournalReferences(auth.user.id, extractTopicHints(what_happened, how_i_responded), PRIVATE_MENTOR_HUB),
      getProfileSnapshots(auth.user.id, PRIVATE_MENTOR_HUB),
      getBaselineAppendixContext(auth.user.id),
    ])

    // Recent interaction signals (Piece 2) only when projection is enabled.
    // Fetched in parallel with the profile load above — we resolve it here
    // because it depends on the loaded profile for passion-map matching.
    const recentInteractionSignals = useProjection
      ? await getRecentInteractionsAsSignals(
          auth.user.id,
          storedProfile?.profile || null,
          PRIVATE_MENTOR_HUB,
          7,
        )
      : null

    const mentorKnowledgeBase = getMentorKnowledgeBase()

    // Pick whichever profile context the flag selected
    const practitionerContext = useProjection ? projectedProfileContext : legacyProfileContext

    let userMessage = `Daily reflection:

What happened: ${what_happened.trim()}
${how_i_responded?.trim() ? `How I responded: ${how_i_responded.trim()}` : ''}

Score my actions and give me the sage perspective.`

    if (practitionerContext) userMessage += `\n\n${practitionerContext}`
    if (recentInteractionSignals) userMessage += `\n\n${recentInteractionSignals}`
    if (baselineAppendixContext) userMessage += `\n\n${baselineAppendixContext}`
    if (mentorObservations) userMessage += `\n\n${mentorObservations}`
    if (journalRefs) userMessage += `\n\n${journalRefs}`
    if (profileSnapshots) userMessage += `\n\n${profileSnapshots}`
    userMessage += `\n\n${projectContext}`
    userMessage += `\n\n${mentorKnowledgeBase}`

    // Token-count logging (approx chars/4) for before/after comparison.
    // Use `mode=v2` vs `mode=legacy` to filter in Vercel logs.
    const tokenLog = {
      mode: useProjection ? 'v2' : 'legacy',
      profile_tokens: estimateTokens(practitionerContext),
      recent_signals_tokens: estimateTokens(recentInteractionSignals),
      baseline_appendix_tokens: estimateTokens(baselineAppendixContext),
      observations_tokens: estimateTokens(mentorObservations),
      journal_refs_tokens: estimateTokens(journalRefs),
      snapshots_tokens: estimateTokens(profileSnapshots),
      user_message_tokens: estimateTokens(userMessage),
      endpoint: '/api/mentor/private/reflect',
    }
    console.log('[mentor-context-tokens]', JSON.stringify(tokenLog))

    // Record session_context_snapshots row (audit trail).
    // Awaited (NOT fire-and-forget) — Vercel terminates the function shortly
    // after the response is sent, killing in-flight promises before the DB
    // insert lands. Same lesson as the profile-update path further down.
    // recordSessionContextSnapshot swallows its own errors via try/catch +
    // console.warn, so the await cannot break the route.
    if (useProjection) {
      const summary = `reflect/v2 profile=${tokenLog.profile_tokens}tk signals=${tokenLog.recent_signals_tokens}tk total=${tokenLog.user_message_tokens}tk`
      const hash = fnv1aHash(userMessage)
      await recordSessionContextSnapshot(auth.user.id, summary, hash)
    }

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
      // Log the FULL raw response so we can see exactly what the LLM returned
      console.error('[private/reflect] JSON PARSE FAILED. Full LLM response follows:')
      console.error('--- RAW START ---')
      console.error(responseText)
      console.error('--- RAW END ---')
      console.error('Parse error:', parseErr)

      // Instead of crashing with 500, return a degraded response
      // so the user still gets something useful and we get analytics
      const effectiveUserId = user_id || auth.user.id
      const { error: parseFailLogError } = await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'daily_reflection',
          user_id: effectiveUserId,
          metadata: {
            mentor_mode: 'private',
            obs_log_status: 'json_parse_failed',
            obs_log_detail: `extractJSON failed. Response length: ${responseText.length}. First 300 chars: ${responseText.substring(0, 300)}`,
          },
        })
      if (parseFailLogError) {
        console.error('[private/reflect] parse-fail analytics insert failed:', parseFailLogError)
      }

      return NextResponse.json(
        {
          result: {
            katorthoma_proximity: 'unknown',
            sage_perspective: 'Your reflection was received but the mentor had difficulty formatting the response. Please try again — this is an intermittent issue with LLM JSON output.',
            evening_prompt: null,
            mentor_observation: null,
            passions_detected: [],
            reflected_at: new Date().toISOString(),
            mentor_mode: 'private',
          },
          _debug_parse_error: true,
        },
        { status: 200, headers: corsHeaders() }
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
    const { error: reflectionInsertError } = await supabaseAdmin
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
    if (reflectionInsertError) {
      console.error('[private/reflect] reflections insert failed:', reflectionInsertError)
    }

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
            },
            PRIVATE_MENTOR_HUB,
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
    const { error: analyticsInsertError } = await supabaseAdmin
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
    if (analyticsInsertError) {
      console.error('[private/reflect] daily_reflection analytics insert failed:', analyticsInsertError)
    }

    // Self-improving feedback loop — feed reflection into Mentor profile
    // Awaited (not fire-and-forget) to ensure writes complete before Vercel terminates the function
    //
    // R3 (session 11, 19 April 2026): if logMentorObservation succeeded above
    // (obsLogStatus === 'logged'), pass the validated observation text as the
    // 6th arg so updateProfileFromReflection → recordInteraction populates
    // mentor_interactions.mentor_observation. Undefined otherwise (stays null,
    // reader degrades to proximity fallback). Never pass raw LLM text here.
    // See: website/src/lib/logging/mentor-observation-logger.ts
    const validatedObservation: string | undefined =
      obsLogStatus === 'logged' ? (structuredObs?.observation || undefined) : undefined

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
        PRIVATE_MENTOR_HUB,
        validatedObservation
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
