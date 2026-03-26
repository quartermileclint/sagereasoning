import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAlignmentTier } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const HIRING_SCORING_PROMPT = `You are the Stoic Sage hiring assessor for sagereasoning.com. You evaluate a candidate's responses to ethical workplace scenarios against Stoic virtue.

This is NOT a personality test — there are no obviously "right" answers. You are measuring the quality of moral reasoning, not agreeableness or social desirability.

Score each response against the four cardinal virtues:
- Wisdom (Phronesis) — 30%: Does the candidate reason carefully? Do they distinguish what matters from what doesn't? Do they consider consequences beyond the obvious?
- Justice (Dikaiosyne) — 25%: Do they treat all parties fairly? Do they consider the common good, not just self-interest?
- Courage (Andreia) — 25%: Are they willing to do what's right even when it's uncomfortable? Do they avoid cowardly deflection?
- Temperance (Sophrosyne) — 20%: Is their response measured? Do they avoid overreaction, self-righteousness, or impulsive judgement?

Return ONLY valid JSON:
{
  "scenarios": [
    {
      "scenario_number": <1-based>,
      "wisdom_score": <0-100>,
      "justice_score": <0-100>,
      "courage_score": <0-100>,
      "temperance_score": <0-100>,
      "total_score": <weighted total>,
      "assessment": "<1-2 sentences: what this response reveals about the candidate's character>"
    }
  ],
  "overall": {
    "wisdom_score": <0-100>,
    "justice_score": <0-100>,
    "courage_score": <0-100>,
    "temperance_score": <0-100>,
    "total_score": <weighted total>,
    "summary": "<2-3 sentences: overall character profile — strengths, gaps, and what to watch for>",
    "strongest_virtue": "<virtue name>",
    "growth_area": "<virtue name>"
  }
}`

// Role-specific scenario banks
const SCENARIOS: Record<string, string[]> = {
  leadership: [
    'Your top performer is consistently rude to junior team members. Clients love them. What do you do?',
    'You discover your company is about to announce layoffs affecting your team. You cannot officially tell them yet. A team member asks you directly if their job is safe. How do you respond?',
    'A project is behind schedule. Your manager suggests cutting corners on quality to meet the deadline. The client won\'t notice the difference. What do you do?',
    'Two equally qualified candidates are up for promotion. One is a close friend who helped you early in your career. The other has slightly better recent performance. How do you decide?',
  ],
  'customer-facing': [
    'A customer is furious about a mistake your company made. They\'re being verbally abusive to you. Your manager isn\'t available. What do you do?',
    'You realise the product you just sold a customer doesn\'t actually fit their needs, but it\'s already been processed. Reversing it will hurt your monthly numbers. What do you do?',
    'A colleague is giving customers incorrect information that makes sales easier but causes problems later. Your manager seems to know but hasn\'t acted. What do you do?',
    'A loyal long-term customer asks you to bend a policy "just this once" as a personal favour. It wouldn\'t hurt anyone directly but sets a precedent. How do you respond?',
  ],
  technical: [
    'You find a significant security vulnerability in production code. Fixing it properly would delay the release by two weeks. A quick patch would likely hold but isn\'t guaranteed. What do you recommend?',
    'A senior engineer\'s architecture proposal has a fundamental flaw that no one else has noticed. They are well-respected and don\'t take criticism well. How do you handle it?',
    'You\'re asked to implement a feature you believe will harm users\' privacy, but it\'s legal and management has approved it. What do you do?',
    'You made a mistake that caused a brief production outage. No one noticed it was your fault. Do you say something?',
  ],
  general: [
    'You discover a colleague is taking credit for work that isn\'t theirs. It doesn\'t affect you directly. What do you do?',
    'Your team is asked to work significant overtime for a project you believe is poorly planned. Refusing would be career-limiting. How do you approach this?',
    'You overhear confidential information about a reorganisation that will affect a close colleague. They have no idea. What do you do?',
    'A vendor offers you a generous personal gift after you chose their product for the company. The gift doesn\'t violate any written policy. How do you respond?',
  ],
}

// GET — Return scenarios for a given role type
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || 'general'

  const scenarios = SCENARIOS[role] || SCENARIOS.general

  return NextResponse.json(
    {
      role,
      available_roles: Object.keys(SCENARIOS),
      scenarios: scenarios.map((s, i) => ({ number: i + 1, scenario: s })),
      instructions:
        'Have the candidate respond to each scenario. Then POST their responses back to this endpoint for scoring.',
    },
    { headers: corsHeaders() }
  )
}

// POST — Score candidate responses
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { role, responses, candidate_name } = await request.json()

    // Validate text lengths
    if (candidate_name) {
      const nameErr = validateTextLength(candidate_name, 'candidate_name', TEXT_LIMITS.medium)
      if (nameErr) {
        return NextResponse.json({ error: nameErr }, { status: 400 })
      }
    }

    if (responses && Array.isArray(responses)) {
      for (const r of responses) {
        if (r.response) {
          const responseErr = validateTextLength(r.response, 'response', TEXT_LIMITS.medium)
          if (responseErr) {
            return NextResponse.json({ error: responseErr }, { status: 400 })
          }
        }
      }
    }

    const roleKey = role && SCENARIOS[role] ? role : 'general'
    const scenarios = SCENARIOS[roleKey]

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        {
          error:
            'responses is required — an array of objects: [{ scenario_number: 1, response: "..." }, ...]',
        },
        { status: 400 }
      )
    }

    // Build prompt
    const scenarioBlock = responses
      .map((r: { scenario_number: number; response: string }) => {
        const idx = (r.scenario_number || 1) - 1
        const scenario = scenarios[idx] || `Scenario ${r.scenario_number}`
        return `Scenario ${r.scenario_number}: ${scenario}\nCandidate response: ${r.response?.trim() || '(no response)'}`
      })
      .join('\n\n')

    const userMessage = `Role type: ${roleKey}${candidate_name ? `\nCandidate: ${candidate_name}` : ''}

${scenarioBlock}

Score each scenario response and provide an overall assessment. Return the JSON.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      temperature: 0.2,
      system: HIRING_SCORING_PROMPT,
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
      console.error('Hiring scorer parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    // Enrich with tiers
    if (scoreData.scenarios) {
      scoreData.scenarios = scoreData.scenarios.map(
        (s: { total_score: number; [key: string]: unknown }) => ({
          ...s,
          alignment_tier: getAlignmentTier(s.total_score),
        })
      )
    }
    if (scoreData.overall) {
      scoreData.overall.alignment_tier = getAlignmentTier(
        scoreData.overall.total_score
      )
    }

    const result = {
      role: roleKey,
      candidate_name: candidate_name || null,
      ...scoreData,
      scored_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'hiring_assessment',
        metadata: {
          role: roleKey,
          overall_score: scoreData.overall?.total_score,
          overall_tier: scoreData.overall?.alignment_tier,
          num_scenarios: responses.length,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Hiring assessment API error:', error)
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
