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
import { extractReceipt, type MechanismId } from '@/lib/reasoning-receipt'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getProjectContext } from '@/lib/context/project-context'

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
    const { action, context, threshold = 'deliberate', agent_id, risk_class, urgency_context, considered_alternatives } = await request.json()

    if (!action || typeof action !== 'string' || action.trim().length === 0) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    // Validate risk_class if provided (Standard / Elevated / Critical)
    const validRiskClasses = ['standard', 'elevated', 'critical'] as const
    type RiskClass = typeof validRiskClasses[number]
    const resolvedRiskClass: RiskClass = (
      typeof risk_class === 'string' && validRiskClasses.includes(risk_class.toLowerCase() as RiskClass)
    ) ? (risk_class.toLowerCase() as RiskClass) : 'standard'

    // Map risk_class to evaluation depth (per project instructions 0d-ii)
    // Standard → quick (3 mechanisms), Elevated → standard (5), Critical → deep (6)
    const riskDepthMap: Record<RiskClass, 'quick' | 'standard' | 'deep'> = {
      standard: 'quick',
      elevated: 'standard',
      critical: 'deep',
    }
    const evaluationDepth = riskDepthMap[resolvedRiskClass]

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

    // Call the shared reasoning engine at risk-appropriate depth
    // Standard actions use quick depth for speed; Critical actions use deep depth for thorough evaluation
    const domainContext = resolvedRiskClass === 'critical'
      ? 'This is a CRITICAL safety gate evaluation. The action involves authentication, access control, data deletion, or deployment configuration. Apply maximum scrutiny. Evaluate whether alternatives were considered and whether a rollback path exists.'
      : resolvedRiskClass === 'elevated'
        ? 'This is an elevated safety gate evaluation. The action modifies existing user-facing functionality or adds external dependencies. Evaluate carefully.'
        : 'This is a binary safety gate evaluation. Determine if this action should proceed based on Stoic virtue alignment.'

    // Layer 3: project context at 'minimal' level (identity + ethical commitments only).
    // Guardrail is a safety gate — ethical commitments are relevant; phase/tensions are not.
    const projectContext = await getProjectContext('minimal')

    const reasoningResult = await runSageReason({
      input: action.trim(),
      context,
      depth: evaluationDepth,
      domain_context: domainContext,
      urgency_context: typeof urgency_context === 'string' ? urgency_context.trim() : undefined,
      stoicBrainContext: getStoicBrainContext(evaluationDepth),
      projectContext,
    })

    const assessmentData = reasoningResult.result as any
    const proximity: KatorthomaProximityLevel = assessmentData.katorthoma_proximity
    const recommendation = getV3Recommendation(proximity, thresholdLevel)
    const proceed = meetsThreshold(proximity, thresholdLevel)

    // Mechanisms applied depends on evaluation depth
    const mechanismsByDepth: Record<string, MechanismId[]> = {
      quick: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
      standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
      deep: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
    }

    // Generate reasoning receipt
    const receipt = extractReceipt({
      skillId: 'sage-guard',
      input: action.trim(),
      evalData: assessmentData,
      mechanisms: mechanismsByDepth[evaluationDepth] || mechanismsByDepth.quick,
    })

    // For Critical actions, extract or flag the rollback path
    const rollbackPath = resolvedRiskClass === 'critical'
      ? (assessmentData.rollback_path || assessmentData.improvement_path || 'No rollback path provided — consider specifying one before proceeding.')
      : undefined

    // Deliberation quality assessment (Item 8)
    // Evaluates whether the decision to act was adequately deliberated,
    // not just whether the action itself is virtuous.
    const hastyAssentRisk = reasoningResult.meta.hasty_assent_risk
    const stageScores = reasoningResult.meta.stage_scores
    let deliberationQuality: 'thorough' | 'adequate' | 'hasty' | 'impulsive' = 'adequate'
    if (hastyAssentRisk === 'high') {
      deliberationQuality = 'impulsive'
    } else if (hastyAssentRisk === 'moderate') {
      deliberationQuality = 'hasty'
    } else if (stageScores) {
      // If all stages are strong, deliberation is thorough
      const scores = Object.values(stageScores).filter(s => s !== 'not_applied')
      const strongCount = scores.filter(s => s === 'strong').length
      deliberationQuality = strongCount === scores.length ? 'thorough' : 'adequate'
    }

    // Considered alternatives check (Item 9)
    // For Critical + urgent actions, flag if no alternatives were evaluated.
    // This is the specific check that would have caught the auth middleware incident.
    let alternativesWarning: string | undefined
    if (resolvedRiskClass === 'critical' && urgency_context) {
      if (!considered_alternatives || (Array.isArray(considered_alternatives) && considered_alternatives.length === 0)) {
        alternativesWarning = 'HASTY ASSENT RISK: This is a Critical action taken under urgency with no alternatives considered. The auth middleware incident pattern applies. Consider what other approaches could achieve the same goal.'
      } else if (Array.isArray(considered_alternatives) && considered_alternatives.length === 1) {
        alternativesWarning = 'Only one alternative was considered for a Critical action under urgency. Consider whether additional options exist.'
      }
    }

    const result: V3GuardrailResponse & {
      reasoning_receipt?: typeof receipt
      risk_class?: string
      evaluation_depth?: string
      rollback_path?: string
      deliberation_quality?: string
      hasty_assent_risk?: string
      considered_alternatives_provided?: number
      alternatives_warning?: string
      stage_scores?: Record<string, string>
    } = {
      proceed: alternativesWarning && resolvedRiskClass === 'critical' ? false : proceed,
      katorthoma_proximity: proximity,
      threshold: thresholdLevel,
      recommendation: alternativesWarning && resolvedRiskClass === 'critical' ? 'pause_for_review' : recommendation,
      passions_detected: assessmentData.passion_diagnosis?.passions_detected || [],
      is_kathekon: assessmentData.is_kathekon,
      kathekon_quality: assessmentData.kathekon_assessment?.quality,
      reasoning: assessmentData.philosophical_reflection || 'Virtue evaluation complete.',
      improvement_hint: assessmentData.improvement_path || undefined,
      disclaimer: V3_DISCLAIMER,
      reasoning_receipt: receipt,
      risk_class: resolvedRiskClass,
      evaluation_depth: evaluationDepth,
      rollback_path: rollbackPath,
      deliberation_quality: deliberationQuality,
      hasty_assent_risk: hastyAssentRisk,
      considered_alternatives_provided: Array.isArray(considered_alternatives) ? considered_alternatives.length : undefined,
      alternatives_warning: alternativesWarning,
      stage_scores: stageScores,
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
          risk_class: resolvedRiskClass,
          evaluation_depth: evaluationDepth,
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
          risk_class: '(optional, default standard) Risk classification: standard | elevated | critical. Controls evaluation depth: standard→quick(3 mechanisms), elevated→standard(5), critical→deep(6). Critical actions also receive a rollback_path field.',
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
          risk_class: 'The resolved risk classification (standard | elevated | critical)',
          evaluation_depth: 'The depth used for evaluation (quick | standard | deep)',
          rollback_path: '(Critical only) How to undo the action if it causes harm',
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
