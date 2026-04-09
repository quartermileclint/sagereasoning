/**
 * skill-handler-map.ts — Direct-import map of skill endpoints to their POST handlers.
 *
 * The execute router (/api/execute) previously made HTTP self-calls to skill
 * endpoints. On Vercel, this fails because:
 *   1. NEXT_PUBLIC_SITE_URL may trigger www/non-www redirects that strip auth headers
 *   2. VERCEL_URL deployment URLs may hit deployment protection (HTML response)
 *
 * This map eliminates HTTP self-calls entirely by importing each skill's POST
 * handler directly. The execute router creates a synthetic NextRequest and calls
 * the handler function in-process — same pattern that fixed context-template.ts.
 *
 * When adding a new skill:
 *   1. Add the route handler file
 *   2. Register in skill-registry.ts
 *   3. Add the import + map entry here
 */

import { NextRequest } from 'next/server'

// ── Core skill handlers (Tier 1 + Tier 2) ──────────────────────────
import { POST as reasonPOST } from '@/app/api/reason/route'
import { POST as scorePOST } from '@/app/api/score/route'
import { POST as guardrailPOST } from '@/app/api/guardrail/route'
import { POST as scoreIteratePOST } from '@/app/api/score-iterate/route'
import { POST as scoreDecisionPOST } from '@/app/api/score-decision/route'
import { POST as scoreDocumentPOST } from '@/app/api/score-document/route'
import { POST as scoreConversationPOST } from '@/app/api/score-conversation/route'
import { POST as scoreScenarioPOST } from '@/app/api/score-scenario/route'
import { POST as reflectPOST } from '@/app/api/reflect/route'
// stoic-brain is GET-only — no POST handler needed
import { POST as assessmentFoundationalPOST } from '@/app/api/assessment/foundational/route'
import { POST as baselineAgentPOST } from '@/app/api/baseline/agent/route'

// ── Context template skills (marketplace) ───────────────────────────
import { POST as preMortemPOST } from '@/app/api/skill/sage-premortem/route'
import { POST as negotiatePOST } from '@/app/api/skill/sage-negotiate/route'
import { POST as investPOST } from '@/app/api/skill/sage-invest/route'
import { POST as pivotPOST } from '@/app/api/skill/sage-pivot/route'
import { POST as retroPOST } from '@/app/api/skill/sage-retro/route'
import { POST as alignPOST } from '@/app/api/skill/sage-align/route'
import { POST as classifyPOST } from '@/app/api/skill/sage-classify/route'
import { POST as prioritisePOST } from '@/app/api/skill/sage-prioritise/route'
import { POST as resolvePOST } from '@/app/api/skill/sage-resolve/route'
import { POST as identityPOST } from '@/app/api/skill/sage-identity/route'
import { POST as coachPOST } from '@/app/api/skill/sage-coach/route'
import { POST as governPOST } from '@/app/api/skill/sage-govern/route'
import { POST as compliancePOST } from '@/app/api/skill/sage-compliance/route'
import { POST as moderatePOST } from '@/app/api/skill/sage-moderate/route'
import { POST as educatePOST } from '@/app/api/skill/sage-educate/route'

// ── Handler type ────────────────────────────────────────────────────
type SkillHandler = (request: NextRequest, ...args: unknown[]) => Promise<Response>

// ── Endpoint → handler map ──────────────────────────────────────────
export const SKILL_HANDLER_MAP: Record<string, SkillHandler> = {
  // Core skills
  '/api/reason': reasonPOST as SkillHandler,
  '/api/score': scorePOST as SkillHandler,
  '/api/guardrail': guardrailPOST as SkillHandler,
  '/api/score-iterate': scoreIteratePOST as SkillHandler,
  '/api/score-decision': scoreDecisionPOST as SkillHandler,
  '/api/score-document': scoreDocumentPOST as SkillHandler,
  '/api/score-conversation': scoreConversationPOST as SkillHandler,
  '/api/score-scenario': scoreScenarioPOST as SkillHandler,
  '/api/reflect': reflectPOST as SkillHandler,
  // stoic-brain is GET-only — not routable via execute POST
  '/api/assessment/foundational': assessmentFoundationalPOST as SkillHandler,
  '/api/baseline/agent': baselineAgentPOST as SkillHandler,

  // Context template skills (marketplace)
  '/api/skill/sage-premortem': preMortemPOST as SkillHandler,
  '/api/skill/sage-negotiate': negotiatePOST as SkillHandler,
  '/api/skill/sage-invest': investPOST as SkillHandler,
  '/api/skill/sage-pivot': pivotPOST as SkillHandler,
  '/api/skill/sage-retro': retroPOST as SkillHandler,
  '/api/skill/sage-align': alignPOST as SkillHandler,
  '/api/skill/sage-classify': classifyPOST as SkillHandler,
  '/api/skill/sage-prioritise': prioritisePOST as SkillHandler,
  '/api/skill/sage-resolve': resolvePOST as SkillHandler,
  '/api/skill/sage-identity': identityPOST as SkillHandler,
  '/api/skill/sage-coach': coachPOST as SkillHandler,
  '/api/skill/sage-govern': governPOST as SkillHandler,
  '/api/skill/sage-compliance': compliancePOST as SkillHandler,
  '/api/skill/sage-moderate': moderatePOST as SkillHandler,
  '/api/skill/sage-educate': educatePOST as SkillHandler,
}

/**
 * Create a synthetic NextRequest to pass to a skill handler.
 * Preserves the original request's auth headers so the skill's own
 * auth check passes without any HTTP roundtrip.
 */
export function createSyntheticRequest(
  endpoint: string,
  method: string,
  body: unknown,
  originalRequest: NextRequest,
): NextRequest {
  const url = new URL(endpoint, 'http://localhost:3000')

  const headers = new Headers({ 'Content-Type': 'application/json' })

  // Forward auth headers from the original request
  const authHeader = originalRequest.headers.get('authorization')
  if (authHeader) headers.set('Authorization', authHeader)

  const apiKeyHeader = originalRequest.headers.get('x-api-key')
  if (apiKeyHeader) headers.set('X-Api-Key', apiKeyHeader)

  // Forward IP for rate limiting
  const forwardedFor = originalRequest.headers.get('x-forwarded-for')
  if (forwardedFor) headers.set('X-Forwarded-For', forwardedFor)

  return new NextRequest(url, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  })
}
