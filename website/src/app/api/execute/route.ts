import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateApiKey, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { getSkillById, SKILL_REGISTRY } from '@/lib/skill-registry'

/**
 * POST /api/execute — Unified Skill Execution Router
 *
 * Outcome: Execute any sage skill by ID with a single endpoint.
 * Cost + Speed: Depends on skill (~$0.0025-$0.50, ~100ms-4s).
 * Chains To: Determined by the executed skill's chains_to.
 *
 * This endpoint lets agents execute any skill by passing the skill_id
 * and the skill's expected input payload. It validates the skill exists,
 * then routes to the appropriate internal handler.
 *
 * Input modes:
 *   1. Explicit: { "skill_id": "sage-reason-quick", "input": { ...payload... } }
 *   2. Intelligent routing: { "input": { "text": "...", "intent": "..." } }
 *      When no skill_id is provided, the router uses keyword matching
 *      to determine the best skill for the input.
 */
export async function POST(request: NextRequest) {
  // TEMPORARY DIAGNOSTIC — remove after debugging
  const _diagBearer = request.headers.get('authorization')?.substring(0, 15) || 'none'
  const _diagCookie = request.cookies.get('sb-access-token')?.value?.substring(0, 10) || 'none'

  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  // Authentication: accept user session (JWT) OR API key
  const authHeader = request.headers.get('authorization')
  const hasBearer = authHeader?.startsWith('Bearer ') || false

  let auth: { user?: { id: string; email?: string }; error?: NextResponse }
  try {
    auth = await requireAuth(request)
  } catch (e) {
    return NextResponse.json(
      { error: 'requireAuth threw', _diag: { message: e instanceof Error ? e.message : String(e), bearer: _diagBearer, cookie: _diagCookie, v: 'v3-throw-catch' } },
      { status: 500 }
    )
  }

  const apiKey = auth.error ? await validateApiKey(request, 'other') : null

  if (auth.error && (!apiKey || !apiKey.valid)) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.', _diag: { hasBearer, hasApiKey: !!request.headers.get('x-api-key'), authFailed: !!auth.error, apiKeyValid: apiKey?.valid ?? null, bearer: _diagBearer, cookie: _diagCookie, v: 'v3' } },
      { status: 401 }
    )
  }

  try {
    const startTime = Date.now()
    const body = await request.json()
    let { skill_id, input: skillInput } = body

    // ── Intelligent routing: classify input to determine skill ────
    if (!skill_id) {
      if (!skillInput || typeof skillInput !== 'object') {
        return NextResponse.json(
          { error: 'Either skill_id or input with text/intent is required. Use GET /api/skills for available skills.' },
          { status: 400 }
        )
      }

      const routingResult = classifyInputToSkill(skillInput)
      if (!routingResult) {
        return NextResponse.json(
          {
            error: 'Could not determine appropriate skill from input. Provide a skill_id explicitly.',
            hint: 'Use GET /api/skills for the full catalogue, or include an "intent" field in your input.',
            available_intents: [
              'reason', 'evaluate', 'guard', 'decide', 'reflect', 'classify',
              'prioritise', 'negotiate', 'invest', 'premortem', 'coach',
            ],
          },
          { status: 400 }
        )
      }

      skill_id = routingResult.skill_id

      // Wrap the result with routing metadata
      const skill = getSkillById(skill_id)
      if (!skill) {
        return NextResponse.json({ error: 'Routing resolved to unknown skill' }, { status: 500 })
      }

      // Forward to the resolved skill
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sagereasoning.com'
      const targetUrl = `${baseUrl}${skill.endpoint}`
      const authHeader = request.headers.get('authorization')
      const apiKeyHeader = request.headers.get('x-api-key')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authHeader) headers['Authorization'] = authHeader
      if (apiKeyHeader) headers['X-Api-Key'] = apiKeyHeader

      const response = await fetch(targetUrl, {
        method: skill.method,
        headers,
        body: skill.method === 'POST' ? JSON.stringify(skillInput) : undefined,
      })

      const data = await response.json()
      if (!response.ok) return NextResponse.json(data, { status: response.status })

      const envelope = buildEnvelope({
        result: {
          skill_id,
          skill_name: skill.name,
          skill_tier: skill.tier,
          routed_by: 'intelligent_routing',
          routing_confidence: routingResult.confidence,
          routing_reason: routingResult.reason,
          execution_result: data,
        },
        endpoint: '/api/execute',
        model: 'routed',
        startTime,
        maxTokens: 0,
        isDeterministic: false,
        composability: {
          next_steps: skill.chains_to.map(id => {
            const chainSkill = getSkillById(id)
            return chainSkill ? chainSkill.endpoint : `/api/skills/${id}`
          }),
          recommended_action: `Routed to ${skill_id} (${routingResult.reason}). ${skill.chains_to.length > 0 ? `Consider chaining to: ${skill.chains_to.join(', ')}` : ''}`,
        },
      })

      return NextResponse.json(envelope, { headers: corsHeaders() })
    }

    // ── Explicit routing: skill_id provided ──────────────────────
    // Look up skill
    const skill = getSkillById(skill_id)
    if (!skill) {
      return NextResponse.json(
        { error: `Skill '${skill_id}' not found. Use GET /api/skills for the full catalogue.` },
        { status: 404 }
      )
    }

    // Validate input is provided
    if (!skillInput || typeof skillInput !== 'object') {
      return NextResponse.json(
        { error: `Input payload is required for skill '${skill_id}'. See GET /api/skills/${skill_id} for example_input.` },
        { status: 400 }
      )
    }

    // For V3 launch: route to the skill's endpoint via internal fetch.
    // This avoids a second external HTTP call while keeping endpoint logic isolated.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sagereasoning.com'
    const targetUrl = `${baseUrl}${skill.endpoint}`

    // Forward the request with the skill's expected input format
    const authHeader = request.headers.get('authorization')
    const apiKeyHeader = request.headers.get('x-api-key')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authHeader) headers['Authorization'] = authHeader
    if (apiKeyHeader) headers['X-Api-Key'] = apiKeyHeader

    const response = await fetch(targetUrl, {
      method: skill.method,
      headers,
      body: skill.method === 'POST' ? JSON.stringify(skillInput) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Wrap in execute envelope with routing metadata
    const envelope = buildEnvelope({
      result: {
        skill_id,
        skill_name: skill.name,
        skill_tier: skill.tier,
        execution_result: data,
      },
      endpoint: '/api/execute',
      model: 'routed',
      startTime,
      maxTokens: 0,
      isDeterministic: false,
      composability: {
        next_steps: skill.chains_to.map(id => {
          const chainSkill = getSkillById(id)
          return chainSkill ? chainSkill.endpoint : `/api/skills/${id}`
        }),
        recommended_action: skill.chains_to.length > 0
          ? `Consider chaining to: ${skill.chains_to.join(', ')}`
          : 'No recommended chain. This skill is a terminal step.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Execute API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── Intelligent routing classifier ──────────────────────────────

type RoutingResult = {
  skill_id: string
  confidence: number
  reason: string
}

/**
 * Keyword-based skill classifier for intelligent routing.
 * Deterministic (no LLM call) — fast and free.
 * Maps intent keywords and input shape to the best skill.
 */
function classifyInputToSkill(input: Record<string, unknown>): RoutingResult | null {
  const text = (
    (input.intent as string) ||
    (input.text as string) ||
    (input.action as string) ||
    (input.input as string) ||
    (input.decision as string) ||
    (input.what_happened as string) ||
    (input.conversation as string) ||
    ''
  ).toLowerCase()

  // Priority 1: Input shape detection (most reliable)
  if (input.action && !input.decision && !input.options) {
    if (input.threshold !== undefined) {
      return { skill_id: 'sage-guard', confidence: 0.95, reason: 'Input contains action + threshold (guardrail pattern)' }
    }
    return { skill_id: 'sage-score', confidence: 0.85, reason: 'Input contains action field (scoring pattern)' }
  }
  if (input.decision && input.options) {
    return { skill_id: 'sage-decide', confidence: 0.95, reason: 'Input contains decision + options (decision pattern)' }
  }
  if (input.what_happened) {
    return { skill_id: 'sage-reflect', confidence: 0.95, reason: 'Input contains what_happened (reflection pattern)' }
  }
  if (input.conversation) {
    return { skill_id: 'sage-converse', confidence: 0.95, reason: 'Input contains conversation (conversation scoring pattern)' }
  }
  if (input.items && Array.isArray(input.items)) {
    return { skill_id: 'sage-prioritise', confidence: 0.90, reason: 'Input contains items array (prioritisation pattern)' }
  }
  if (input.content && input.categories) {
    return { skill_id: 'sage-classify', confidence: 0.90, reason: 'Input contains content + categories (classification pattern)' }
  }

  // Priority 2: Intent keyword matching
  const intentMap: [RegExp, string, string][] = [
    [/\b(guard|guardrail|gate|check before|should i proceed|safe to)\b/, 'sage-guard', 'guard/safety intent'],
    [/\b(decide|decision|choose|which option|weigh options)\b/, 'sage-decide', 'decision intent'],
    [/\b(reflect|journal|daily review|what happened|how i responded)\b/, 'sage-reflect', 'reflection intent'],
    [/\b(conversation|dialogue|chat|discuss|meeting notes)\b/, 'sage-converse', 'conversation intent'],
    [/\b(classify|categorize|sort|label|tag|bucket)\b/, 'sage-classify', 'classification intent'],
    [/\b(prioriti[sz]e|rank|order|urgent|important|triage)\b/, 'sage-prioritise', 'prioritisation intent'],
    [/\b(premortem|risk|what could go wrong|failure mode)\b/, 'sage-premortem', 'premortem intent'],
    [/\b(negotiat|deal|bargain|offer|counter.?offer)\b/, 'sage-negotiate', 'negotiation intent'],
    [/\b(invest|portfolio|financial|market|stock)\b/, 'sage-invest', 'investment intent'],
    [/\b(pivot|change direction|strategic shift|alternative path)\b/, 'sage-pivot', 'pivot intent'],
    [/\b(retro|retrospective|post.?mortem|lessons learned)\b/, 'sage-retro', 'retrospective intent'],
    [/\b(align|team alignment|values|mission|stakeholder)\b/, 'sage-align', 'alignment intent'],
    [/\b(resolv|conflict|disagree|dispute|mediat)\b/, 'sage-resolve', 'conflict resolution intent'],
    [/\b(coach|mentor|develop|grow|practice)\b/, 'sage-coach', 'coaching intent'],
    [/\b(govern|governance|policy|oversight)\b/, 'sage-govern', 'governance intent'],
    [/\b(compl[iy]|regulat|audit|standard)\b/, 'sage-compliance', 'compliance intent'],
    [/\b(moderat|content review|flag|inappropriate)\b/, 'sage-moderate', 'moderation intent'],
    [/\b(educat|teach|learn|curriculum|lesson)\b/, 'sage-educate', 'education intent'],
    [/\b(identity|who am i|character|persona)\b/, 'sage-identity', 'identity intent'],
    [/\b(score|evaluat|assess|rate|analyz)\b/, 'sage-score', 'evaluation intent'],
    [/\b(reason|think|consider|deliberat|analys)\b/, 'sage-reason-standard', 'general reasoning intent'],
  ]

  for (const [pattern, skillId, reason] of intentMap) {
    if (pattern.test(text)) {
      return { skill_id: skillId, confidence: 0.70, reason: `Keyword match: ${reason}` }
    }
  }

  // Priority 3: Fallback to sage-reason-standard if there's any text
  if (text.length > 5) {
    return { skill_id: 'sage-reason-standard', confidence: 0.40, reason: 'No specific intent detected, defaulting to general reasoning' }
  }

  return null
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
