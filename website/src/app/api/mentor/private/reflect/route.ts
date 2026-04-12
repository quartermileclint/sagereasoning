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
import { getMentorObservations, getJournalReferences, getProfileSnapshots } from '@/lib/context/mentor-context-private'
import { extractJSON } from '@/lib/json-utils'

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
  "mentor_observation": "<1-2 sentences: a qualitative observation about this practitioner's pattern, tendency, or growth that you want to remember for future sessions. Focus on what this reflection reveals about their development trajectory, not just what happened today. Examples: 'Consistently avoids naming fear as a passion — may indicate blind spot around andreia', 'Shows growing capacity to catch false judgements before acting on them'>",
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
      getMentorObservations(auth.user.id, 'private-mentor'),
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

    const result = {
      katorthoma_proximity: reflectionData.katorthoma_proximity,
      passions_detected: reflectionData.passions_detected || [],
      what_you_did_well: reflectionData.what_you_did_well,
      sage_perspective: reflectionData.sage_perspective,
      mentor_observation: reflectionData.mentor_observation || null,
      evening_prompt: reflectionData.evening_prompt,
      reasoning_receipt: receipt,
      disclaimer: reflectionData.disclaimer,
      reflected_at: new Date().toISOString(),
      mentor_mode: 'private',
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'daily_reflection',
        user_id: effectiveUserId,
        metadata: {
          katorthoma_proximity: reflectionData.katorthoma_proximity,
          passions_count: (reflectionData.passions_detected || []).length,
          mentor_mode: 'private',
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
          sage_perspective: reflectionData.mentor_observation || reflectionData.sage_perspective,
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
