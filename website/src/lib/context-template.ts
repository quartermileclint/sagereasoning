/**
 * context-template.ts — Shared factory for context template skills.
 *
 * Context templates are Tier 2 marketplace skills that wrap sage-reason
 * with domain-specific context. Each template:
 * 1. Accepts domain-specific input fields
 * 2. Formats them into a sage-reason call with domain_context
 * 3. Returns the sage-reason result with skill-specific framing
 *
 * Phase 4A: Skills are context templates over sage-reason, not independent engines.
 * R12: Each original skill derives from at least 2 Stoic Brain mechanisms.
 * R3: All evaluative output includes the standard disclaimer.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateApiKey, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { extractReceipt, type MechanismId } from '@/lib/reasoning-receipt'
import { getSkillById } from '@/lib/skill-registry'

const SAGE_REASON_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/reason`
  : 'https://www.sagereasoning.com/api/reason'

export type ContextTemplateConfig = {
  /** Skill ID (e.g., 'sage-premortem') */
  skillId: string
  /** Display name */
  name: string
  /** API endpoint path */
  endpoint: string
  /** sage-reason depth to use */
  depth: 'quick' | 'standard' | 'deep'
  /** Skills this chains to */
  chainsTo: string[]
  /** Domain context injected into sage-reason call */
  domainContext: string
  /** Function to format skill-specific input into a sage-reason input string */
  formatInput: (body: Record<string, unknown>) => { input: string; context?: string } | { error: string }
  /** Function to validate required fields */
  validateInput: (body: Record<string, unknown>) => string | null
  /** Optional additional framing added to the result */
  frameResult?: (result: Record<string, unknown>) => Record<string, unknown>
}

/**
 * Create a POST handler for a context template skill.
 *
 * Usage:
 *   export const POST = createContextTemplateHandler(config)
 */
export function createContextTemplateHandler(config: ContextTemplateConfig) {
  return async function POST(request: NextRequest) {
    // TEMPORARY DIAGNOSTIC — return immediately to prove handler runs
    const _ctDiagAuth = request.headers.get('authorization')?.substring(0, 15) || 'none'
    const _ctDiagCookie = request.cookies.get('sb-access-token')?.value?.substring(0, 10) || 'none'

    // TEMPORARY: Early return to prove handler executes — REMOVE after debugging
    return NextResponse.json({ _ct_diag: true, skill: config.skillId, bearer: _ctDiagAuth, cookie: _ctDiagCookie, v: 'ct-v4-early' }, { status: 299 })

    // Everything below is unreachable due to early return diagnostic above
    return NextResponse.json({ error: 'unreachable' }, { status: 500 })
  }
}

/**
 * Create a standard OPTIONS handler for CORS preflight.
 */
export function createOptionsHandler() {
  return async function OPTIONS() {
    return corsPreflightResponse()
  }
}
