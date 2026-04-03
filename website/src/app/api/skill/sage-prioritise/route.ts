import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAuth,
  validateTextLength,
  TEXT_LIMITS,
  corsHeaders,
  corsPreflightResponse,
} from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import {
  buildPrioritisePrompt,
  buildPrioritiseResponse,
  validatePrioritiseRequest,
  type SagePrioritiseRequest,
  type PriorityHorizon,
} from '@/lib/sage-prioritise'

// =============================================================================
// POST /api/skill/sage-prioritise — Stoic-Reasoned Prioritisation
//
// ENHANCED from context template to full prioritisation engine.
// Previous version: thin wrapper over sage-reason with domain context.
// New version: custom LLM call with structured item ranking, passion
//              detection per item, oikeiosis mapping, and reasoning receipts.
//
// Outcome: Rank 2-20 items by principled reasoning, not urgency or fear.
//          Returns per-item reasoning, action recommendations, and patterns.
// Cost + Speed: ~$0.18, ~2s (1 API call, haiku model)
// Chains To: sage-reason-standard
//
// Use cases:
//   - OpenBrain proactive agent loops (step 9)
//   - Zeus/CoLab daily briefing
//   - Any agent deciding what to work on next
//
// R1:  No therapeutic implication.
// R3:  Disclaimer on every response.
// R4:  Prioritisation prompt is server-side only.
// R6c: Qualitative proximity levels, not numeric scores.
// R8d: Plain English in agent-facing output.
// R9:  Evaluates reasoning quality of prioritisation, does not guarantee outcomes.
// R12: 3 mechanisms (control_filter, passion_diagnosis, oikeiosis).
// =============================================================================

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

    // ── Build and validate request ──────────────────────────────────
    // Support both the new structured format and the legacy string/array format
    let prioritiseRequest: SagePrioritiseRequest

    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      // Check if items are structured objects or plain strings
      if (typeof body.items[0] === 'string') {
        // Legacy format: array of strings → convert to structured items
        prioritiseRequest = {
          items: body.items.map((item: string, idx: number) => ({
            id: `item_${idx + 1}`,
            description: item,
          })),
          objective: body.criteria || body.objective,
          stakeholders: body.stakeholders,
          horizon: body.horizon as PriorityHorizon | undefined,
          agent_id: body.agent_id,
        }
      } else {
        // New structured format
        prioritiseRequest = {
          items: body.items,
          objective: body.objective,
          stakeholders: body.stakeholders,
          horizon: body.horizon as PriorityHorizon | undefined,
          agent_id: body.agent_id,
        }
      }
    } else if (typeof body.items === 'string') {
      // Legacy format: single string with items → split by newlines
      const lines = body.items
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)
      if (lines.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 items required for prioritisation.' },
          { status: 400 },
        )
      }
      prioritiseRequest = {
        items: lines.map((line: string, idx: number) => ({
          id: `item_${idx + 1}`,
          description: line.replace(/^\d+\.\s*/, ''), // strip leading "1. "
        })),
        objective: body.criteria || body.objective,
        stakeholders: body.stakeholders,
        horizon: body.horizon as PriorityHorizon | undefined,
        agent_id: body.agent_id,
      }
    } else {
      return NextResponse.json(
        { error: 'items is required. Provide an array of items to prioritise.' },
        { status: 400 },
      )
    }

    // Validate
    const validation = validatePrioritiseRequest(prioritiseRequest)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Validate text lengths on descriptions
    for (const item of prioritiseRequest.items) {
      const err = validateTextLength(item.description, `Item ${item.id}`, TEXT_LIMITS.medium)
      if (err) return NextResponse.json({ error: err }, { status: 400 })
    }

    // ── Check cache ─────────────────────────────────────────────────
    const ck = cacheKey('/api/skill/sage-prioritise', {
      items: prioritiseRequest.items.map(i => i.description).join('|'),
      objective: prioritiseRequest.objective,
      horizon: prioritiseRequest.horizon,
    })
    const cached = cacheGet(ck)
    if (cached) {
      const envelope = buildEnvelope({
        result: cached,
        endpoint: '/api/skill/sage-prioritise',
        model: MODEL_FAST,
        startTime,
        maxTokens: 1024,
        composability: {
          next_steps: ['/api/reason'],
          recommended_action: 'Items marked "reconsider" should be evaluated with sage-reason before acting.',
        },
      })
      return NextResponse.json(envelope, { headers: corsHeaders() })
    }

    // ── Call LLM ────────────────────────────────────────────────────
    const systemPrompt = buildPrioritisePrompt(prioritiseRequest)

    const message = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 1024,
      temperature: 0.2,
      system: [
        { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
      ],
      messages: [
        {
          role: 'user',
          content: `Prioritise these ${prioritiseRequest.items.length} items using Stoic reasoning. Return only the JSON evaluation object.`,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // ── Parse LLM response ──────────────────────────────────────────
    let llmOutput
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      llmOutput = JSON.parse(cleaned)
    } catch {
      console.error('sage-prioritise: Failed to parse LLM response:', responseText)
      return NextResponse.json(
        { error: 'Prioritisation engine returned invalid response' },
        { status: 500 },
      )
    }

    // Validate required fields
    if (!llmOutput.ranked_items || !Array.isArray(llmOutput.ranked_items)) {
      console.error('sage-prioritise: Missing ranked_items in LLM output')
      return NextResponse.json(
        { error: 'Prioritisation engine missing ranked_items' },
        { status: 500 },
      )
    }

    // ── Build typed response ────────────────────────────────────────
    const result = buildPrioritiseResponse(llmOutput, prioritiseRequest)

    // Cache the result
    cacheSet(ck, result)

    // ── Build envelope ──────────────────────────────────────────────
    const doNowCount = result.ranked_items.filter(i => i.action === 'do_now').length
    const reconsiderCount = result.ranked_items.filter(i => i.action === 'reconsider').length

    const envelope = buildEnvelope({
      result: {
        skill_id: 'sage-prioritise',
        ...result,
      },
      endpoint: '/api/skill/sage-prioritise',
      model: MODEL_FAST,
      startTime,
      maxTokens: 1024,
      composability: {
        next_steps: reconsiderCount > 0
          ? ['/api/reason', '/api/skill/sage-prioritise']
          : ['/api/reason'],
        recommended_action: reconsiderCount > 0
          ? `${reconsiderCount} item(s) flagged for reconsideration — evaluate with sage-reason before acting.`
          : doNowCount > 0
            ? `${doNowCount} item(s) ready for immediate action.`
            : 'All items scheduled or deferred. Review prioritisation regularly.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('sage-prioritise API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
