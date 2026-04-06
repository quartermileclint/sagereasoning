import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST } from '@/lib/model-config'
import { runSageReason } from '@/lib/sage-reason-engine'

/**
 * sage-score — Evaluate a single action through Stoic virtue principles.
 *
 * Uses the shared sage-reason engine (standard depth) with action-specific
 * domain context for passion and virtue assessment.
 *
 * Unique to this endpoint:
 *   - Input parsing for relationships, emotional_state, prior_feedback
 *   - Domain context construction for action scoring
 *   - Response envelope with composability hints
 */

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  // Authentication required
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { action, context, relationships, emotional_state, prior_feedback } = await request.json()

    if (!action || action.trim().length === 0) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Text length limits
    const actionErr = validateTextLength(action, 'Action', TEXT_LIMITS.short)
    if (actionErr) return NextResponse.json({ error: actionErr }, { status: 400 })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })

    // Build domain context from score-specific fields
    let domainContext = `This is an action evaluation request. Assess whether the action aligns with Stoic virtue principles.`
    if (relationships?.trim()) {
      domainContext += `\nRelationships involved: ${relationships.trim()}`
    }
    if (emotional_state?.trim()) {
      domainContext += `\nEmotional state: ${emotional_state.trim()}`
    }

    // Optional: prior_feedback for deliberation context
    if (prior_feedback && typeof prior_feedback === 'object') {
      const pf = prior_feedback as {
        previous_action?: string
        previous_proximity?: string
        passions_identified?: string[]
        false_judgements?: string[]
        sage_reflection?: string
      }
      if (pf.previous_action || pf.previous_proximity) {
        domainContext += `\n\nDELIBERATION CONTEXT (iterating on a previous action):
Previous action: ${pf.previous_action || 'not provided'}
Previous proximity level: ${pf.previous_proximity || 'not provided'}
Passions previously identified: ${pf.passions_identified?.join(', ') || 'none'}
False judgements previously identified: ${pf.false_judgements?.join('; ') || 'none'}
Sage reflection on previous action: ${pf.sage_reflection || 'not provided'}
Note: Evaluate the current action on its own merits, but acknowledge if it addresses previously identified passions and false judgements.`
      }
    }

    // Call the shared reasoning engine at standard depth
    const reasoningResult = await runSageReason({
      input: action.trim(),
      context,
      depth: 'standard',
      domain_context: domainContext,
    })

    // Build response envelope with composability hints
    const envelope = buildEnvelope({
      result: reasoningResult.result,
      endpoint: '/api/score',
      model: MODEL_FAST,
      startTime,
      maxTokens: 1024,
      composability: {
        next_steps: ['/api/score-iterate', '/api/reason'],
        recommended_action: (reasoningResult.result as any).virtue_quality?.katorthoma_proximity === 'reflexive' || (reasoningResult.result as any).virtue_quality?.katorthoma_proximity === 'habitual'
          ? 'Address the false judgements identified in passion_diagnosis, then re-evaluate with /api/score-iterate.'
          : 'Consider a deeper analysis with /api/reason?depth=deep for iterative refinement tracking.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
