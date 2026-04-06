import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  meetsThreshold,
  getV3Recommendation,
  type V3GuardrailResponse,
} from '@/lib/guardrails'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, validateApiKey, withUsageHeaders, validateTextLength, TEXT_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { runSageReason } from '@/lib/sage-reason-engine'

/**
 * sage-guard — Binary safety gate for AI agent actions.
 *
 * Uses the shared sage-reason engine (quick depth for speed) to evaluate
 * whether an action meets a Stoic virtue threshold before executing.
 *
 * Unique to this endpoint:
 *   - Uses quick depth (3 mechanisms, Haiku model) for speed
 *   - API-key authentication (not user auth)
 *   - Binary proceed/proceed_with_caution decision
 *   - Threshold comparison against proximity level
 *   - Usage tracking per API key
 */

const V3_DISCLAIMER = 'This assessment is based on V3 virtue evaluation. Results reflect the agent\'s action\'s alignment with Stoic virtue principles at a specific moment. No assessment is final; agents should exercise practical wisdom in decision-making.'

// POST — Check an action against Stoic virtue guardrails before executing
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const keyCheck = await validateApiKey(request, 'guardrail')
  if (!keyCheck.valid) return keyCheck.error

  try {
    const startTime = Date.now()
    const { action, context, threshold = 'deliberate', agent_id } = await request.json()

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

    // Validate threshold is a valid proximity level
    const validProximityLevels: KatorthomaProximityLevel[] = [
      'reflexive',
      'habitual',
      'deliberate',
      'principled',
      'sage_like',
    ]
    const thresholdLevel = (typeof threshold === 'string' && validProximityLevels.includes(threshold as KatorthomaProximityLevel))
      ? (threshold as KatorthomaProximityLevel)
      : 'deliberate'

    // Call the shared reasoning engine at quick depth for speed
    // Domain context indicates this is a guardrail check
    const domainContext = 'This is a binary safety gate evaluation. Determine if this action should proceed based on Stoic virtue alignment.'

    const reasoningResult = await runSageReason({
      input: action.trim(),
      context,
      depth: 'quick',
      domain_context: domainContext,
    })

    const assessmentData = reasoningResult.result as any
    const proximity: KatorthomaProximityLevel = assessmentData.katorthoma_proximity
    const recommendation = getV3Recommendation(proximity, thresholdLevel)
    const proceed = meetsThreshold(proximity, thresholdLevel)

    // Generate reasoning receipt
    const receipt = extractReceipt({
      skillId: 'sage-guard',
      input: action.trim(),
      evalData: assessmentData,
      mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
    })

    const result: V3GuardrailResponse & { reasoning_receipt?: typeof receipt } = {
      proceed,
      katorthoma_proximity: proximity,
      threshold: thresholdLevel,
      recommendation,
      passions_detected: assessmentData.passion_diagnosis?.passions_detected || [],
      is_kathekon: assessmentData.is_kathekon,
      kathekon_quality: assessmentData.kathekon_assessment?.quality,
      reasoning: assessmentData.philosophical_reflection || 'Virtue evaluation complete.',
      improvement_hint: assessmentData.improvement_path || undefined,
      disclaimer: V3_DISCLAIMER,
      reasoning_receipt: receipt,
    }

    // Analytics (fire and forget)
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'guardrail_check_v3',
        metadata: {
          agent_id: agent_id || null,
          proximity: proximity,
          recommendation,
          proceed,
          threshold: thresholdLevel,
          is_kathekon: result.is_kathekon,
          passions_count: result.passions_detected.length,
        },
      })
      .then(() => {})

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/guardrail',
      model: 'claude-haiku-4-5-20251001',
      startTime,
      maxTokens: 512,
      usage: keyCheck.valid ? {
        monthly_calls_after: keyCheck.monthly_calls_after,
        monthly_limit: keyCheck.monthly_calls_after + keyCheck.monthly_remaining,
        monthly_remaining: keyCheck.monthly_remaining,
      } : undefined,
      composability: {
        next_steps: result.proceed ? ['execute_action'] : ['/api/guardrail'],
        recommended_action: result.recommendation,
      },
    })

    return NextResponse.json(envelope, {
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
      name: 'SageReasoning Stoic Guardrail — V3',
      description:
        'V3 virtue-gate middleware for AI agents. Call before executing an action to check if it meets your ethical threshold using katorthoma proximity levels.',
      usage: {
        method: 'POST',
        url: 'https://www.sagereasoning.com/api/guardrail',
        body: {
          action: '(required) Description of the action the agent is about to take',
          context: '(optional) Additional context about the situation',
          threshold:
            '(optional, default deliberate) Minimum proximity level: reflexive | habitual | deliberate | principled | sage_like',
          agent_id: '(optional) Your agent identifier for tracking',
        },
        response: {
          proceed: 'boolean — true if proximity meets or exceeds threshold',
          katorthoma_proximity: 'reflexive | habitual | deliberate | principled | sage_like',
          recommendation:
            'proceed | proceed_with_caution | pause_for_review | do_not_proceed',
          is_kathekon: 'boolean — whether action is appropriate',
          kathekon_quality: 'strong | moderate | marginal | contrary',
          passions_detected: 'array of detected passions with root_passion, sub_species, false_judgement',
          reasoning: 'Brief virtue assessment',
          improvement_hint: 'How to make the action more virtuous (if below principled)',
          disclaimer: 'Standard disclaimer about the assessment',
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
    threshold: 'principled',
    agent_id: 'my-agent-v3'
  })
}).then(r => r.json());

if (!check.proceed) {
  console.log('Action blocked:', check.reasoning);
  console.log('Proximity level:', check.katorthoma_proximity);
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
