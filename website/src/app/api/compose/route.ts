import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { getSkillById } from '@/lib/skill-registry'
import { SKILL_HANDLER_MAP, createSyntheticRequest } from '@/lib/skill-handler-map'
import { enforceDistressCheck } from '@/lib/constraints'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import {
  isR20aGapClosureEnabled,
  composeDistressSubject,
  buildMildSupportResources,
} from '@/lib/r20a-gap-closure'

/**
 * The R20a subject for this orchestrator — every string a caller puts inside
 * `steps[].input`, at any depth.
 *
 * ⚠ WHY THIS ROUTE IS SCREENED AT ALL, given it only delegates. It was drafted
 * as a perimeter EXCLUSION on the ground that SKILL_HANDLER_MAP imports each
 * target route's own POST, so a screened target screens exactly as it does over
 * HTTP. That is true and was verified — and it is incomplete. Not every target
 * screens: /api/guardrail, /api/score-iterate, /api/assessment/* and
 * /api/baseline/agent are agent-facing and deliberately outside the perimeter.
 *
 * The first reading was that those are unreachable for a human, since each takes
 * validateApiKey and would 401 a forwarded Supabase JWT. But createSyntheticRequest
 * forwards BOTH `Authorization` AND `X-Api-Key` (skill-handler-map.ts:109-113), so
 * a caller holding a session AND an agent credential — which /api/keys lets any
 * signed-in user mint — authenticates as a human here and as an agent downstream.
 * Their text reaches an unscreened LLM.
 *
 * Screening at the orchestrator closes that at the point the human principal is
 * established, and makes the downstream question moot.
 *
 * Walks nested values because `input` is an arbitrary per-skill payload shape and
 * a fixed field list would silently miss whichever skill is added next.
 */
function collectStepText(value: unknown, depth = 0, acc: unknown[] = []): unknown[] {
  if (depth > 4 || acc.length >= 20) return acc
  if (typeof value === 'string') { acc.push(value); return acc }
  if (Array.isArray(value)) { for (const v of value) collectStepText(v, depth + 1, acc); return acc }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) collectStepText(v, depth + 1, acc)
  }
  return acc
}

/**
 * POST /api/compose — Execute a chain of skills sequentially
 *
 * Allows agents to compose multiple sage skills into a pipeline.
 * Each step's output is passed as context to the next step.
 *
 * Input:
 *   {
 *     "steps": [
 *       { "skill_id": "sage-guard", "input": { "action": "...", "threshold": "deliberate" } },
 *       { "skill_id": "sage-reason-standard", "input": { "input": "..." } },
 *       { "skill_id": "sage-score", "input": { "action": "..." } }
 *     ],
 *     "stop_on_failure": true,          // Stop chain if any step returns an error (default: true)
 *     "stop_on_guard_block": true,      // Stop chain if sage-guard returns proceed=false (default: true)
 *     "agent_id": "optional-agent-id"
 *   }
 *
 * Each step is executed in order. The previous step's result is available
 * as `_previous_result` in the next step's input if not explicitly provided.
 *
 * Max 5 steps per chain to prevent abuse.
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const body = await request.json()
    // ── R20a perimeter (AC5; added 2026-08-18) ───────────────────────────────
    // Runs BEFORE steps validation and before any handler is invoked, so no
    // downstream skill sees the text until it has been screened here.
    let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
    if (isR20aGapClosureEnabled()) {
      const gate = await enforceDistressCheck(
        detectDistressTwoStage(composeDistressSubject(collectStepText(body?.steps)))
      )
      if (gate.result.distress_detected && gate.result.severity !== 'mild') {
        return NextResponse.json({
          distress_detected: true,
          severity: gate.result.severity,
          redirect_message: gate.result.redirect_message,
        })
      }
      if (gate.result.severity === 'mild') {
        mildSupport = buildMildSupportResources('skill')
      }
    }

    const {
      steps,
      stop_on_failure = true,
      stop_on_guard_block = true,
      agent_id: _agent_id,
    } = body

    // Validate steps
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: 'steps array is required (min 1, max 5 skill steps)' },
        { status: 400 }
      )
    }

    if (steps.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 steps per compose chain. Break larger pipelines into multiple calls.' },
        { status: 400 }
      )
    }

    // Validate all skills exist before executing any
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      if (!step.skill_id || typeof step.skill_id !== 'string') {
        return NextResponse.json(
          { error: `Step ${i + 1}: skill_id is required` },
          { status: 400 }
        )
      }
      const skill = getSkillById(step.skill_id)
      if (!skill) {
        return NextResponse.json(
          { error: `Step ${i + 1}: skill '${step.skill_id}' not found. Use GET /api/skills for available skills.` },
          { status: 404 }
        )
      }
    }

    // Execute steps sequentially
    const results: StepResult[] = []
    let previousResult: Record<string, unknown> | null = null
    let chainStopped = false
    let stopReason: string | null = null

    for (let i = 0; i < steps.length; i++) {
      if (chainStopped) {
        results.push({
          step: i + 1,
          skill_id: steps[i].skill_id,
          status: 'skipped',
          reason: stopReason || 'Previous step stopped the chain',
        })
        continue
      }

      const step = steps[i]
      const skill = getSkillById(step.skill_id)!

      // Merge previous result into input if available
      const stepInput: Record<string, unknown> = {
        ...step.input,
        ...(previousResult ? { _previous_result: previousResult } : {}),
      }

      const stepStart = Date.now()

      try {
        // Direct handler call — no HTTP self-call
        const handler = SKILL_HANDLER_MAP[skill.endpoint]
        if (!handler) {
          throw new Error(`No handler registered for endpoint ${skill.endpoint}`)
        }

        const syntheticRequest = createSyntheticRequest(skill.endpoint, skill.method, stepInput, request)
        const response = await handler(syntheticRequest)
        const data: Record<string, unknown> = await response.json()
        const stepDuration = Date.now() - stepStart

        if (response.status >= 400) {
          results.push({
            step: i + 1,
            skill_id: step.skill_id,
            status: 'error',
            error: (data.error as string) || `HTTP ${response.status}`,
            latency_ms: stepDuration,
          })

          if (stop_on_failure) {
            chainStopped = true
            stopReason = `Step ${i + 1} (${step.skill_id}) returned error: ${(data.error as string) || response.status}`
          }
          continue
        }

        // Check for guard block
        const resultData: Record<string, unknown> = (data.result || data) as Record<string, unknown>
        if (stop_on_guard_block && step.skill_id === 'sage-guard' && resultData.proceed === false) {
          results.push({
            step: i + 1,
            skill_id: step.skill_id,
            status: 'blocked',
            result: resultData,
            latency_ms: stepDuration,
          })
          chainStopped = true
          stopReason = `sage-guard blocked: ${resultData.recommendation || 'action did not meet threshold'}`
          continue
        }

        results.push({
          step: i + 1,
          skill_id: step.skill_id,
          status: 'success',
          result: resultData,
          latency_ms: stepDuration,
        })

        previousResult = resultData
      } catch (err) {
        const stepDuration = Date.now() - stepStart
        results.push({
          step: i + 1,
          skill_id: step.skill_id,
          status: 'error',
          error: 'Internal execution error',
          latency_ms: stepDuration,
        })

        if (stop_on_failure) {
          chainStopped = true
          stopReason = `Step ${i + 1} (${step.skill_id}) threw an error`
        }
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const chainStatus = chainStopped
      ? (results.some(r => r.status === 'blocked') ? 'blocked' : 'partial')
      : 'complete'

    const result = {
      chain_status: chainStatus,
      steps_executed: results.filter(r => r.status !== 'skipped').length,
      steps_succeeded: successCount,
      steps_total: steps.length,
      stop_reason: stopReason,
      results,
      final_result: previousResult,
      disclaimer: 'Composed skill chains inherit all disclaimers from individual skills. Ancient reasoning, modern application.',
    }

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/compose',
      model: 'composed',
      startTime,
      maxTokens: 0,
      isDeterministic: false,
      composability: {
        next_steps: chainStatus === 'complete'
          ? ['/api/receipts', '/api/patterns']
          : ['/api/compose'],
        recommended_action: chainStatus === 'complete'
          ? `Chain complete (${successCount}/${steps.length} steps). Store receipts via POST /api/receipts.`
          : `Chain ${chainStatus}. ${stopReason || 'Review results and retry.'}`,
      },
    })

    return NextResponse.json(
      mildSupport ? { ...envelope, support_resources: mildSupport } : envelope,
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('Compose API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}

// ── Types ──────────────────────────────────────────────────────
interface StepResult {
  step: number
  skill_id: string
  status: 'success' | 'error' | 'blocked' | 'skipped'
  result?: Record<string, unknown>
  error?: string
  reason?: string
  latency_ms?: number
}
