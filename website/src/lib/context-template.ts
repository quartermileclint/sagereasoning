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
    // Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
    if (rateLimitError) return rateLimitError

    // Authentication: accept user session (JWT) OR API key
    // Marketplace skills should be accessible to both human users and agent developers
    const auth = await requireAuth(request)
    const apiKey = auth.error ? await validateApiKey(request, 'other') : null

    if (auth.error && (!apiKey || !apiKey.valid)) {
      return auth.error
    }

    try {
      const startTime = Date.now()
      const body = await request.json()

      // Validate skill-specific input
      const validationError = config.validateInput(body)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }

      // Format input for sage-reason
      const formatted = config.formatInput(body)
      if ('error' in formatted) {
        return NextResponse.json({ error: formatted.error }, { status: 400 })
      }

      // Call sage-reason internally — forward whichever auth credential was used
      const authHeader = request.headers.get('authorization')
      const apiKeyHeader = request.headers.get('x-api-key')
      const reasonResponse = await fetch(SAGE_REASON_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {}),
          ...(apiKeyHeader ? { 'X-Api-Key': apiKeyHeader } : {}),
        },
        body: JSON.stringify({
          input: formatted.input,
          context: formatted.context,
          depth: config.depth,
          domain_context: config.domainContext,
        }),
      })

      const reasonData = await reasonResponse.json()

      if (!reasonResponse.ok) {
        return NextResponse.json(reasonData, { status: reasonResponse.status })
      }

      // Extract the result from sage-reason's envelope
      const reasonResult = reasonData.result || reasonData

      // Apply skill-specific framing if configured
      const framedResult = config.frameResult
        ? config.frameResult(reasonResult)
        : reasonResult

      // Generate reasoning receipt from sage-reason result
      const skillDef = getSkillById(config.skillId)
      const mechanisms = (skillDef?.mechanisms || ['control_filter', 'passion_diagnosis', 'oikeiosis']) as MechanismId[]
      const receipt = extractReceipt({
        skillId: config.skillId,
        input: formatted.input,
        evalData: framedResult as any,
        mechanisms,
      })

      // Add skill metadata
      const skillResult = {
        skill_id: config.skillId,
        skill_name: config.name,
        ...framedResult,
        reasoning_receipt: receipt,
        disclaimer: 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.',
      }

      const envelope = buildEnvelope({
        result: skillResult,
        endpoint: config.endpoint,
        model: 'claude-sonnet-4-6',
        startTime,
        maxTokens: config.depth === 'quick' ? 1024 : config.depth === 'standard' ? 1536 : 2048,
        composability: {
          next_steps: config.chainsTo.map(id => `/api/skills/${id}`),
          recommended_action: config.chainsTo.length > 0
            ? `Consider chaining to: ${config.chainsTo.join(', ')}`
            : 'This is a terminal skill. Apply the insights directly.',
        },
      })

      return NextResponse.json(envelope, { headers: corsHeaders() })
    } catch (error) {
      console.error(`${config.skillId} error:`, error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
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
