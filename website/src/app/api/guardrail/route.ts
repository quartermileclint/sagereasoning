import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  getRecommendation,
  GUARDRAIL_SCORING_PROMPT,
  type GuardrailResponse,
} from '@/lib/guardrails'
import { getAlignmentTier } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, validateApiKey, withUsageHeaders, validateTextLength, TEXT_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// POST — Check an action against Stoic virtue guardrails before executing
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const keyCheck = await validateApiKey(request, 'guardrail')
  if (!keyCheck.valid) return keyCheck.error

  try {
    const { action, context, threshold = 50, agent_id } = await request.json()

    if (!action || typeof action !== 'string' || action.trim().length === 0) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    const actionErr = validateTextLength(action, 'action', TEXT_LIMITS.medium)
    if (actionErr) {
      return NextResponse.json({ error: actionErr }, { status: 400 })
    }

    if (context) {
      const contextErr = validateTextLength(context, 'context', TEXT_LIMITS.medium)
      if (contextErr) {
        return NextResponse.json({ error: contextErr }, { status: 400 })
      }
    }

    const clampedThreshold = Math.max(0, Math.min(100, Number(threshold) || 50))

    const userMessage = `An AI agent is about to execute this action. Score it.

Action: ${action.trim()}
${context?.trim() ? `Context: ${context.trim()}` : ''}

Return the JSON score.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      temperature: 0.2,
      system: GUARDRAIL_SCORING_PROMPT,
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
      console.error('Guardrail parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    const tier = getAlignmentTier(scoreData.total_score)
    const recommendation = getRecommendation(scoreData.total_score, clampedThreshold)

    const result: GuardrailResponse = {
      proceed: scoreData.total_score >= clampedThreshold,
      total_score: scoreData.total_score,
      wisdom_score: scoreData.wisdom_score,
      justice_score: scoreData.justice_score,
      courage_score: scoreData.courage_score,
      temperance_score: scoreData.temperance_score,
      alignment_tier: tier,
      threshold: clampedThreshold,
      reasoning: scoreData.reasoning,
      recommendation,
      improvement_hint: scoreData.improvement_hint || undefined,
    }

    // Analytics (fire and forget)
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'guardrail_check',
        metadata: {
          agent_id: agent_id || null,
          total_score: scoreData.total_score,
          tier,
          recommendation,
          proceed: result.proceed,
          threshold: clampedThreshold,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck),
    })
  } catch (error) {
    console.error('Guardrail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET — Return usage documentation
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  return NextResponse.json(
    {
      name: 'SageReasoning Stoic Guardrail',
      description:
        'Virtue-gate middleware for AI agents. Call before executing an action to check if it meets your ethical threshold.',
      usage: {
        method: 'POST',
        url: 'https://www.sagereasoning.com/api/guardrail',
        body: {
          action: '(required) Description of the action the agent is about to take',
          context: '(optional) Additional context about the situation',
          threshold:
            '(optional, default 50) Minimum score to proceed. Higher = stricter.',
          agent_id: '(optional) Your agent identifier for tracking',
        },
        response: {
          proceed: 'boolean — true if score >= threshold',
          total_score: '0-100 weighted score',
          recommendation:
            'proceed | proceed_with_caution | pause_for_review | do_not_proceed',
          reasoning: 'Brief virtue assessment',
          improvement_hint: 'How to make the action more virtuous (if score < 70)',
        },
      },
      example_integration: `
// Before executing any action:
const check = await fetch('https://www.sagereasoning.com/api/guardrail', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'Send automated marketing emails to all users',
    context: 'Users did not explicitly opt in to marketing',
    threshold: 60,
    agent_id: 'my-agent-v1'
  })
}).then(r => r.json());

if (!check.proceed) {
  console.log('Action blocked:', check.reasoning);
  console.log('Try:', check.improvement_hint);
}
`.trim(),
    },
    {
      headers: {
        ...publicCorsHeaders(),
        'Cache-Control': 'public, max-age=3600',
      },
    }
  )
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return publicCorsPreflightResponse()
}
