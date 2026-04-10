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
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getOpsBrainContext } from '@/lib/context/ops-brain-loader'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { getEnvironmentalContext } from '@/lib/context/environmental-context'
import {
  buildClassifyPrompt,
  buildClassifyResponse,
  OPENBRAIN_DEFAULT_CATEGORIES,
  type SageClassifyRequest,
  type ClassifyCategory,
} from '@/lib/sage-classify'

// =============================================================================
// POST /api/skill/sage-classify — Reasoned Classification for OpenBrain
//
// Outcome: Classify input into user-defined categories with reasoning quality
//          assessment, passion flags, oikeiosis mapping, and reasoning receipt.
// Cost + Speed: ~$0.18, ~2s (1 API call, haiku model)
// Chains To: sage-reason-standard, sage-prioritise
//
// Designed for OpenBrain AI Sorter (step 4): accepts raw input + category
// definitions, returns classification + structured reasoning receipt.
//
// R1:  No therapeutic implication in classification output.
// R3:  Disclaimer on every response.
// R4:  Classification prompt is server-side only.
// R8d: Plain English in agent-facing output.
// R9:  Evaluates reasoning quality, does not predict outcomes.
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

    // ── Validate input ──────────────────────────────────────────────
    const { input, categories, context, confidence_threshold } = body as {
      input?: string
      categories?: ClassifyCategory[]
      context?: string
      confidence_threshold?: number
    }

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'input is required. Provide the text to classify.' },
        { status: 400 },
      )
    }

    const inputErr = validateTextLength(input, 'Input', TEXT_LIMITS.medium)
    if (inputErr) return NextResponse.json({ error: inputErr }, { status: 400 })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })

    // Validate categories if provided
    const resolvedCategories: ClassifyCategory[] =
      Array.isArray(categories) && categories.length >= 2
        ? categories
        : OPENBRAIN_DEFAULT_CATEGORIES

    for (const cat of resolvedCategories) {
      if (!cat.id || !cat.label || !cat.description) {
        return NextResponse.json(
          { error: 'Each category must have id, label, and description.' },
          { status: 400 },
        )
      }
    }

    // Validate confidence threshold
    const threshold =
      typeof confidence_threshold === 'number'
        ? Math.max(0, Math.min(1, confidence_threshold))
        : 0.7

    // ── Build request ───────────────────────────────────────────────
    const classifyRequest: SageClassifyRequest = {
      input: input.trim(),
      categories: resolvedCategories,
      context: context?.trim(),
      confidence_threshold: threshold,
    }

    // ── Check cache ─────────────────────────────────────────────────
    const ck = cacheKey('/api/skill/sage-classify', {
      input: classifyRequest.input,
      categories: resolvedCategories.map(c => c.id).join(','),
      context: classifyRequest.context,
      threshold,
    })
    const cached = cacheGet(ck)
    if (cached) {
      const envelope = buildEnvelope({
        result: cached,
        endpoint: '/api/skill/sage-classify',
        model: MODEL_FAST,
        startTime,
        maxTokens: 768,
        composability: {
          next_steps: ['/api/reason', '/api/skill/sage-prioritise'],
          recommended_action:
            'If input was flagged urgent or held for review, evaluate with sage-reason for deeper analysis.',
        },
      })
      return NextResponse.json(envelope, { headers: corsHeaders() })
    }

    // ── Context layers injection ──────────────────────────────────
    const stoicBrainContext = getStoicBrainContext('quick')
    const opsBrainContext = getOpsBrainContext('quick')
    const practitionerContext = await getPractitionerContext(auth.user.id)
    const projectContext = await getProjectContext('condensed')
    const environmentalContext = await getEnvironmentalContext('ops')

    // ── Call LLM ────────────────────────────────────────────────────
    const systemPrompt = buildClassifyPrompt(classifyRequest)

    let userContent = `Classify this input and evaluate its reasoning quality. Return only the JSON evaluation object.\n\nInput: ${classifyRequest.input}`
    if (practitionerContext) userContent += `\n\n${practitionerContext}`
    userContent += `\n\n${projectContext}`
    if (environmentalContext) userContent += `\n\n${environmentalContext}`

    const message = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 768,
      temperature: 0.2,
      system: [
        { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: stoicBrainContext },
        { type: 'text', text: opsBrainContext },
      ],
      messages: [
        {
          role: 'user',
          content: userContent,
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
      console.error('sage-classify: Failed to parse LLM response:', responseText)
      return NextResponse.json(
        { error: 'Classification engine returned invalid response' },
        { status: 500 },
      )
    }

    // Validate required fields
    const requiredFields = ['category', 'confidence', 'reasoning', 'input_proximity']
    for (const field of requiredFields) {
      if (llmOutput[field] === undefined) {
        console.error(`sage-classify: Missing field '${field}' in LLM output`)
        return NextResponse.json(
          { error: `Classification engine missing field: ${field}` },
          { status: 500 },
        )
      }
    }

    // ── Build typed response ────────────────────────────────────────
    const result = buildClassifyResponse(llmOutput, classifyRequest)

    // Cache the result
    cacheSet(ck, result)

    // ── Build envelope ──────────────────────────────────────────────
    const envelope = buildEnvelope({
      result: {
        skill_id: 'sage-classify',
        ...result,
      },
      endpoint: '/api/skill/sage-classify',
      model: MODEL_FAST,
      startTime,
      maxTokens: 768,
      composability: {
        next_steps: ['/api/reason', '/api/skill/sage-prioritise'],
        recommended_action:
          result.action === 'flag_urgent'
            ? 'Passion-driven input detected. Evaluate with sage-reason before acting.'
            : result.action === 'hold_for_review'
              ? 'Classification uncertain. Human review recommended.'
              : result.action === 'defer'
                ? 'Low reasoning quality. Consider deeper evaluation with sage-reason.'
                : 'Classification complete. Route to structured storage.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('sage-classify API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
