import { NextRequest, NextResponse } from 'next/server'
import { publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { getSkillById } from '@/lib/skill-registry'

/**
 * GET /api/skills/{id} — Full skill contract with example I/O
 *
 * Outcome: Complete contract for a specific skill including example_input and example_output.
 * Cost + Speed: Free, <50ms (deterministic, no AI call).
 * Chains To: /api/execute, the skill's own endpoint.
 *
 * Public endpoint — no authentication required.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  const { id } = params

  const skill = getSkillById(id)

  if (!skill) {
    return NextResponse.json(
      { error: `Skill '${id}' not found. Use GET /api/skills for the full catalogue.` },
      { status: 404, headers: publicCorsHeaders() }
    )
  }

  const envelope = buildEnvelope({
    result: skill,
    endpoint: `/api/skills/${id}`,
    model: 'none',
    startTime,
    maxTokens: 0,
    isDeterministic: true,
    composability: {
      next_steps: [skill.endpoint],
      recommended_action: `Call ${skill.method} ${skill.endpoint} with the example_input to try this skill.`,
      chain_start: skill.example_input,
    },
  })

  return NextResponse.json(envelope, {
    headers: {
      ...publicCorsHeaders(),
      'Cache-Control': 'public, max-age=300',
    },
  })
}

export async function OPTIONS() {
  return publicCorsPreflightResponse()
}
