import { NextResponse } from 'next/server'
import { publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { getAllSkills } from '@/lib/skill-registry'

/**
 * GET /api/skills — List all capabilities as skill contracts
 *
 * Outcome: Agent-readable catalogue of all sage skills with Outcome/Cost/Chains To contracts.
 * Cost + Speed: Free, <50ms (deterministic, no AI call).
 * Chains To: /api/skills/{id}
 *
 * Public endpoint — no authentication required.
 * Returns the full skill registry without example_input/example_output (use /skills/{id} for those).
 */
export async function GET() {
  const startTime = Date.now()

  const skills = getAllSkills()

  const envelope = buildEnvelope({
    result: {
      skills,
      count: skills.length,
      tiers: {
        tier1_infrastructure: skills.filter(s => s.tier === 'tier1_infrastructure').length,
        tier2_evaluation: skills.filter(s => s.tier === 'tier2_evaluation').length,
        tier3_wrapper: skills.filter(s => s.tier === 'tier3_wrapper').length,
      },
    },
    endpoint: '/api/skills',
    model: 'none',
    startTime,
    maxTokens: 0,
    isDeterministic: true,
    composability: {
      next_steps: ['/api/skills/{id}', '/api/evaluate', '/api/reason'],
      recommended_action: 'Fetch individual skill details with /api/skills/{id} for example_input and example_output.',
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
