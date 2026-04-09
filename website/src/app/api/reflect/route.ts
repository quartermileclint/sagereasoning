import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { getStoicBrainContextForMechanisms } from '@/lib/context/stoic-brain-loader'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
// Profile update is loaded dynamically via the sage-mentor bridge pattern
// to avoid build-time resolution failures when sage-mentor dependencies
// aren't available in the website build context.

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
  "disclaimer": "This reflection is guidance, not judgment. Only you know the full context of your choices. Stoic practice is about sustained effort toward virtue, not perfection."
}`

// POST — Submit a daily reflection
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

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

    // Context layers injection
    const stoicBrainContext = getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis'])
    const practitionerContext = await getPractitionerContext(auth.user.id)
    const projectContext = await getProjectContext('minimal')

    let userMessage = `Daily reflection:

What happened: ${what_happened.trim()}
${how_i_responded?.trim() ? `How I responded: ${how_i_responded.trim()}` : ''}

Score my actions and give me the sage perspective.`

    if (practitionerContext) userMessage += `\n\n${practitionerContext}`
    userMessage += `\n\n${projectContext}`

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

    let reflectionData
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      reflectionData = JSON.parse(cleaned)
    } catch {
      console.error('Reflection scorer parse error:', responseText)
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

    // Save reflection if user_id provided
    if (user_id) {
      await supabaseAdmin
        .from('reflections')
        .insert({
          user_id,
          what_happened: what_happened.trim(),
          how_responded: how_i_responded?.trim() || null,
          katorthoma_proximity: reflectionData.katorthoma_proximity,
          passions_detected: reflectionData.passions_detected || [],
          sage_perspective: reflectionData.sage_perspective,
          evening_prompt: reflectionData.evening_prompt,
        })
        .then(() => {})
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

    const result = {
      katorthoma_proximity: reflectionData.katorthoma_proximity,
      passions_detected: reflectionData.passions_detected || [],
      what_you_did_well: reflectionData.what_you_did_well,
      sage_perspective: reflectionData.sage_perspective,
      evening_prompt: reflectionData.evening_prompt,
      reasoning_receipt: receipt,
      disclaimer: reflectionData.disclaimer,
      reflected_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'daily_reflection',
        user_id: user_id || null,
        metadata: {
          katorthoma_proximity: reflectionData.katorthoma_proximity,
          passions_count: (reflectionData.passions_detected || []).length,
        },
      })
      .then(() => {})

    // Self-improving feedback loop (Gap 3 wiring):
    // Feed reflection findings back into the Mentor profile.
    // This updates the passion map and causal tendencies so the ring wrapper's
    // BEFORE phase (which reads the profile) benefits from this reflection
    // on the next interaction. Fire-and-forget — don't block the API response.
    //
    // Uses dynamic import (bridge pattern) to avoid build-time resolution
    // failures when sage-mentor isn't available in the website build context.
    if (user_id) {
      import('../../../../../sage-mentor/profile-store')
        .then(({ updateProfileFromReflection }) => {
          return updateProfileFromReflection(
            supabaseAdmin as any,
            user_id,
            {
              katorthoma_proximity: reflectionData.katorthoma_proximity,
              passions_detected: reflectionData.passions_detected || [],
              what_you_did_well: reflectionData.what_you_did_well,
              sage_perspective: reflectionData.sage_perspective,
            },
            what_happened.trim()
          )
        })
        .catch((err: unknown) => {
          // Profile update failure must not break the reflection API.
          // This includes the case where sage-mentor module isn't available.
          console.error('Reflect → profile update failed (non-blocking):', err)
        })
    }

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/reflect',
      model: 'claude-sonnet-4-6',
      startTime,
      maxTokens: 1024,
      composability: {
        next_steps: ['/api/reflect', '/api/score'],
        recommended_action: user_id
          ? 'Reflect on the sage perspective and evening prompt. Reflection findings are being fed back into your Mentor profile (passion map, rolling window). The next interaction will benefit from this reflection.'
          : 'Reflect on the sage perspective and evening prompt. No user_id provided — reflection stored but Mentor profile not updated.',
      },
    })

    return NextResponse.json(envelope, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Reflection API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
