import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAlignmentTier } from '@/lib/document-scorer'

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
  "topic": "<1-2 words: the core ethical theme — e.g. honesty, loyalty, fairness>"
}

WHEN SCORING A RESPONSE:
Score the user's chosen or written response against the four virtues, adjusted for their audience level. Be encouraging but honest.

Return ONLY valid JSON:
{
  "wisdom_score": <0-100>,
  "justice_score": <0-100>,
  "courage_score": <0-100>,
  "temperance_score": <0-100>,
  "total_score": <weighted total>,
  "feedback": "<2-3 sentences: age-appropriate feedback. What virtue did they show? What could they consider next time?>",
  "sage_says": "<1 sentence: what a Stoic sage would say to this young person — warm, wise, direct>"
}`

type Audience = 'child' | 'teen' | 'adult'

const TOPIC_POOLS: Record<Audience, string[]> = {
  child: ['sharing', 'honesty', 'including others', 'standing up for a friend', 'following rules vs doing right', 'dealing with anger'],
  teen: ['peer pressure', 'social media honesty', 'cheating', 'standing up to bullying', 'loyalty vs truth', 'respecting authority vs questioning it'],
  adult: ['workplace ethics', 'civic duty', 'honest communication', 'balancing self-care and obligation', 'financial integrity', 'moral courage'],
}

// GET — Generate a scenario
export async function GET(request: NextRequest) {
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
      system: SCENARIO_PROMPT,
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
      headers: { 'Access-Control-Allow-Origin': '*' },
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

    const validAudience = audience || 'teen'

    const userMessage = `Audience level: ${validAudience}

Scenario: ${scenario.trim()}

User's response: ${response.trim()}

Score this response. Return the JSON.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.2,
      system: SCENARIO_PROMPT,
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

    const tier = getAlignmentTier(scoreData.total_score)

    const result = {
      audience: validAudience,
      ...scoreData,
      alignment_tier: tier,
      scored_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'scenario_scored',
        user_id: user_id || null,
        metadata: {
          audience: validAudience,
          total_score: scoreData.total_score,
          tier,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
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
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
