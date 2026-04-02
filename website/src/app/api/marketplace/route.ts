import { NextResponse } from 'next/server'
import { publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { getAllSkills } from '@/lib/skill-registry'

/**
 * GET /api/marketplace — Agent-facing skill marketplace catalogue
 *
 * Outcome: Browse available sage skills with pricing, descriptions, and contracts.
 * Cost + Speed: Free, <50ms (deterministic, no AI call).
 * Chains To: /api/marketplace/{id}, /api/execute
 *
 * Public endpoint — no authentication required.
 * Returns all marketplace-eligible skills (Tier 2 context templates + evaluation skills).
 * Excludes Tier 1 infrastructure (sage-reason depths) which are accessed directly.
 *
 * R10: All marketplace-listed skills comply with R1, R2, R3, R7, R9.
 * R4: Marketplace preview does not expose full skill implementation.
 * R8d: Skill descriptions use plain English, outcome-focused language.
 */
export async function GET() {
  const startTime = Date.now()

  const allSkills = getAllSkills()

  // Marketplace shows Tier 2 skills only (context templates + evaluation skills)
  // Tier 1 (sage-reason) is infrastructure, accessed via /api/reason directly
  const marketplaceSkills = allSkills
    .filter(s => s.tier === 'tier2_evaluation')
    .map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      outcome: s.outcome,
      cost_speed: s.cost_speed,
      mechanism_count: s.mechanism_count,
      auth_required: s.auth_required,
      chains_to: s.chains_to,
      detail_url: `/api/marketplace/${s.id}`,
    }))

  const envelope = buildEnvelope({
    result: {
      skills: marketplaceSkills,
      count: marketplaceSkills.length,
      categories: {
        decision_analysis: marketplaceSkills.filter(s =>
          ['sage-premortem', 'sage-invest', 'sage-pivot', 'sage-prioritise', 'sage-decide'].includes(s.id)
        ).length,
        interpersonal: marketplaceSkills.filter(s =>
          ['sage-negotiate', 'sage-align', 'sage-resolve', 'sage-coach'].includes(s.id)
        ).length,
        reflection: marketplaceSkills.filter(s =>
          ['sage-retro', 'sage-reflect', 'sage-identity'].includes(s.id)
        ).length,
        governance: marketplaceSkills.filter(s =>
          ['sage-govern', 'sage-compliance', 'sage-moderate', 'sage-educate'].includes(s.id)
        ).length,
        core: marketplaceSkills.filter(s =>
          ['sage-score', 'sage-guard', 'sage-iterate', 'sage-audit', 'sage-converse', 'sage-scenario', 'sage-context', 'sage-diagnose', 'sage-profile'].includes(s.id)
        ).length,
      },
      pricing_note: 'All skills use per-call pricing. Free tier: 100 calls/month across all endpoints. Wrappers consume 2-3 calls per invocation.',
    },
    endpoint: '/api/marketplace',
    model: 'none',
    startTime,
    maxTokens: 0,
    isDeterministic: true,
    composability: {
      next_steps: ['/api/marketplace/{id}', '/api/execute'],
      recommended_action: 'Fetch individual skill details with /api/marketplace/{id} for full contract and example I/O.',
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
