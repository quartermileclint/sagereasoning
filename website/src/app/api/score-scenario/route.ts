import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SCENARIO_PROMPT = `You are the Stoic Sage education companion for sagereasoning.com. You create age-appropriate ethical dilemmas and score responses to help young people develop virtue-based reasoning.

AUDIENCE LEVELS:
- "child" (ages 6-11): Simple language, relatable school/family situations, gentle scoring, lots of encouragement
- "teen" (ages 12-17): More complex situations involving peer pressure, social media, fairness, growing independence
- "adult" (ages 18+): Full complexity — workplace, relationships, civic duty, moral ambiguity

WHEN GENERATING SCENARIOS:
Create an ethical dilemma appropriate to the audience level. Make it specific and relatable — not abstract philosophy. Include 3-4 possible responses that the user can choose from or write their own. None of the options should be obviously "right" — each should reflect different virtues and trade-offs.

Return ONLY valid JSON:
{
  "scenario": "<the ethical dilemma — 2-4 sentences>",
  "options": [
    { "label": "A", "text": "<option text>" },
    { "label": "B", "text": "<option text>" },
    { "label": "C", "text": "<option text>" }
  ],
  "topic": "<1-2 words: the core ethical theme — e.g. honesty, loyalty, fairness>",
  "oikeiosis_circles_at_stake": "<which concentric circles of relationship are affected: self, family, community, humanity, nature, or cosmos>"
}

WHEN SCORING A RESPONSE (V3 FORMAT):
Analyze the user's response against Stoic principles. Do NOT assign numeric scores.

Instead, evaluate:
1. katorthoma_proximity: How closely aligned is this response to right action? Use one of: "reflexive" (habitual reaction), "habitual" (trained response), "deliberate" (consciously chosen), "principled" (virtue-grounded), "sage_like" (exemplary Stoic wisdom)

2. passions_detected: Array of detected emotional impulses, formatted as:
[{
  "root_passion": "epithumia" (appetite/desire), "hedone" (pleasure-seeking), "phobos" (fear), or "lupe" (distress),
  "sub_species": "<specific passion, e.g., 'fear of social rejection', 'appetite for status'>",
  "false_judgement": "<the underlying false belief driving this passion>"
}]

3. kathekon_quality: The degree to which the response embodies duty and appropriate action:
- "strong": Response demonstrates clear duty-consciousness and virtue alignment
- "moderate": Response shows some duty-awareness with minor misalignments
- "marginal": Response minimally addresses duty; mostly driven by passions or external pressures
- "contrary": Response actively violates duty or virtue principles

4. feedback: 2-3 sentences age-appropriate commentary. Acknowledge what the person understood, highlight the virtue they touched or missed, invite reflection.

5. sage_says: 1 sentence from a Stoic sage — warm, direct, wise. Focus on what is within the person's control (prohairesis).

Return ONLY valid JSON:
{
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "passions_detected": [{"root_passion": "epithumia|hedone|phobos|lupe", "sub_species": "string", "false_judgement": "string"}],
  "kathekon_quality": "strong|moderate|marginal|contrary",
  "feedback": "<2-3 sentences>",
  "sage_says": "<1 sentence>"
}

DISCLAIMER: This V3 scoring reflects Stoic principles of duty (kathekon), right action (katorthoma), and the pathology of passions (pathos). It is meant for reflection and education, not judgment.`

type Audience = 'child' | 'teen' | 'adult'

const TOPIC_POOLS: Record<Audience, string[]> = {
  child: ['sharing', 'honesty', 'including others', 'standing up for a friend', 'following rules vs doing right', 'dealing with anger'],
  teen: ['peer pressure', 'social media honesty', 'cheating', 'standing up to bullying', 'loyalty vs truth', 'respecting authority vs questioning it'],
  adult: ['workplace ethics', 'civic duty', 'honest communication', 'balancing self-care and obligation', 'financial integrity', 'moral courage'],
}

// GET — Generate a scenario
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const audience = (searchParams.get('audience') || 'teen') as Audience
    const topic = searchParams.get('topic') || null

    const validAudience = TOPIC_POOLS[audience] ? audience : 'teen'
    const pool = TOPIC_POOLS[validAudience]
    const selectedTopic = topic || pool[Math.floor(Math.random() * pool.length)]

    const userMessage = `Generate an ethical scenario for audience: ${validAudience}
Topic hint: ${selectedTopic}

Return the JSON scenario with options.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.7,
      system: [{ type: 'text', text: SCENARIO_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let scenarioData
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      scenarioData = JSON.parse(cleaned)
    } catch {
      console.error('Scenario generator parse error:', responseText)
      return NextResponse.json(
        { error: 'Failed to generate scenario' },
        { status: 500 }
      )
    }

    const result = {
      audience: validAudience,
      ...scenarioData,
      oikeiosis_circles_at_stake: scenarioData.oikeiosis_circles_at_stake || 'community',
      instructions: 'Choose one of the options above, or write your own response. Then POST it back to this endpoint for scoring.',
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'scenario_generated',
        metadata: { audience: validAudience, topic: scenarioData.topic || selectedTopic },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Scenario generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST — Score a response to a scenario
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { scenario, response, audience, user_id } = await request.json()

    if (!scenario || typeof scenario !== 'string') {
      return NextResponse.json(
        { error: 'scenario is required — the ethical dilemma text' },
        { status: 400 }
      )
    }

    if (!response || typeof response !== 'string' || response.trim().length < 5) {
      return NextResponse.json(
        { error: 'response is required — the user\'s answer (min 5 characters)' },
        { status: 400 }
      )
    }

    // Validate text lengths
    const scenarioErr = validateTextLength(scenario, 'scenario', TEXT_LIMITS.medium)
    if (scenarioErr) {
      return NextResponse.json({ error: scenarioErr }, { status: 400 })
    }

    const responseErr = validateTextLength(response, 'response', TEXT_LIMITS.medium)
    if (responseErr) {
      return NextResponse.json({ error: responseErr }, { status: 400 })
    }

    const validAudience = audience || 'teen'

    const userMessage = `Audience level: ${validAudience}

Scenario: ${scenario.trim()}

User's response: ${response.trim()}

Score this response. Return the JSON.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.2,
      system: [{ type: 'text', text: SCENARIO_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let scoreData
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      console.error('Scenario scorer parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    // Validate V3 structure
    const validProximities: KatorthomaProximityLevel[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
    const validKathekonQualities = ['strong', 'moderate', 'marginal', 'contrary']

    const proximityLevel = validProximities.includes(scoreData.katorthoma_proximity)
      ? scoreData.katorthoma_proximity
      : 'deliberate'

    const kathekonQuality = validKathekonQualities.includes(scoreData.kathekon_quality)
      ? scoreData.kathekon_quality
      : 'moderate'

    const passionsDetected = Array.isArray(scoreData.passions_detected)
      ? scoreData.passions_detected.filter((p: any) =>
          ['epithumia', 'hedone', 'phobos', 'lupe'].includes(p.root_passion)
        )
      : []

    const result = {
      audience: validAudience,
      katorthoma_proximity: proximityLevel,
      passions_detected: passionsDetected,
      kathekon_quality: kathekonQuality,
      feedback: scoreData.feedback || 'Consider how your choice reflects your duty to yourself and others.',
      sage_says: scoreData.sage_says || 'What you control is your effort and intention — focus there.',
      scored_at: new Date().toISOString(),
      disclaimer: 'This V3 scoring reflects Stoic principles of duty (kathekon) and right action (katorthoma). It is meant for reflection and education, not judgment.',
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'scenario_scored_v3',
        user_id: user_id || null,
        metadata: {
          audience: validAudience,
          katorthoma_proximity: proximityLevel,
          kathekon_quality: kathekonQuality,
          passions_count: passionsDetected.length,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Scenario score API error:', error)
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
