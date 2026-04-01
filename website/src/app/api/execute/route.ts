import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { getSkillById } from '@/lib/skill-registry'

/**
 * POST /api/execute — Unified Skill Execution Router
 *
 * Outcome: Execute any sage skill by ID with a single endpoint.
 * Cost + Speed: Depends on skill (~$0.001-$0.055, ~100ms-4s).
 * Chains To: Determined by the executed skill's chains_to.
 *
 * This endpoint lets agents execute any skill by passing the skill_id
 * and the skill's expected input payload. It validates the skill exists,
 * then routes to the appropriate internal handler.
 *
 * Input:
 *   { "skill_id": "sage-reason-quick", "input": { ...skill-specific payload... } }
 *
 * For V3 launch, this endpoint validates the skill exists and returns
 * routing information. Full internal routing (calling the actual skill
 * handler without a second HTTP call) will be implemented when the
 * skill execution layer is built.
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
    const body = await request.json()
    const { skill_id, input: skillInput } = body

    // Validate skill_id
    if (!skill_id || typeof skill_id !== 'string') {
      return NextResponse.json(
        { error: 'skill_id is required. Use GET /api/skills for available skills.' },
        { status: 400 }
      )
    }

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

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
