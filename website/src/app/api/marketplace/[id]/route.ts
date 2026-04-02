import { NextRequest, NextResponse } from 'next/server'
import { publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { getSkillById } from '@/lib/skill-registry'

/**
 * GET /api/marketplace/{id} — Full skill contract for a marketplace skill
 *
 * Outcome: Complete contract for a specific skill including example_input, example_output,
 *          and mechanism details. Agents use this to understand what the skill does before
 *          calling it.
 * Cost + Speed: Free, <50ms (deterministic, no AI call).
 * Chains To: /api/execute, the skill's own endpoint.
 *
 * Public endpoint — no authentication required.
 *
 * R4: Returns example I/O but not system prompts or evaluation logic.
 * R8d: Descriptions use plain English, outcome-focused language.
 * R10: Marketplace skills comply with R1, R2, R3, R7, R9.
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
      { error: `Skill '${id}' not found in marketplace. Use GET /api/marketplace for the full catalogue.` },
      { status: 404, headers: publicCorsHeaders() }
    )
  }

  // Only show Tier 2 skills in the marketplace
  // Tier 1 (sage-reason) is accessed via /api/skills/{id} directly
  if (skill.tier === 'tier1_infrastructure') {
    return NextResponse.json(
      {
        error: `'${id}' is infrastructure, not a marketplace skill. Access it via /api/skills/${id} instead.`,
        redirect: `/api/skills/${id}`,
      },
      { status: 303, headers: publicCorsHeaders() }
    )
  }

  const marketplaceEntry = {
    ...skill,
    // Add marketplace-specific metadata
    marketplace: {
      available: true,
      pricing: 'per-call (included in monthly API allowance)',
      free_tier_eligible: true,
      requires_api_key: skill.auth_required,
    },
    // R10 compliance markers
    compliance: {
      R1_no_therapeutic: true,
      R2_no_employment: true,
      R3_disclaimer_included: true,
      R9_no_outcome_promises: true,
    },
  }

  const envelope = buildEnvelope({
    result: marketplaceEntry,
    endpoint: `/api/marketplace/${id}`,
    model: 'none',
    startTime,
    maxTokens: 0,
    isDeterministic: true,
    composability: {
      next_steps: [skill.endpoint, '/api/execute'],
      recommended_action: `Call ${skill.method} ${skill.endpoint} with the example_input to try this skill, or use POST /api/execute with skill_id: "${id}".`,
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
