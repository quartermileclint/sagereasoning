import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, validateTextLength, TEXT_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * POST /api/evaluate — No-auth instant demo endpoint
 *
 * Outcome: Try sage-reason instantly — no signup, no API key. Returns a
 *          quick-depth (core triad) evaluation of any decision input.
 * Cost + Speed: Free, ~2s. Rate-limited to prevent abuse.
 * Chains To: /api/reason (with auth for deeper analysis)
 *
 * This endpoint exists to let developers and agents experience sage-reason
 * before committing to signup. It runs the core triad (Control Filter +
 * Passion Diagnosis + Oikeiosis) at quick depth only.
 *
 * Limitations vs /api/reason:
 * - Quick depth only (3 mechanisms, not 5 or 6)
 * - Stricter rate limit (5/min vs 15/min for authenticated)
 * - Shorter input limit (500 chars vs 5000)
 * - No domain_context parameter
 * - No usage tracking (not tied to an API key)
 *
 * R3: Disclaimer included.
 * R4: System prompt server-side only.
 * R5: This is a free evaluation endpoint — does not count against monthly allowance.
 */

// Stricter rate limit for unauthenticated endpoint
const EVALUATE_RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 60,
  category: 'evaluate-demo',
}

/**
 * Minimal system prompt for quick evaluation (core triad only).
 * Shorter than the full sage-reason prompt to reduce cost per free call.
 */
const DEMO_SYSTEM_PROMPT = `You are the sage-reason evaluation engine. Apply the Stoic core triad to evaluate a decision input. Return structured JSON only.

MECHANISM 1 — CONTROL FILTER
Separate what is within the agent's moral choice (prohairesis) from externals.
Output: within_prohairesis (array), outside_prohairesis (array)

MECHANISM 2 — PASSION DIAGNOSIS
Which passions distort this reasoning? Root passions: epithumia (craving), hedone (irrational pleasure), phobos (fear), lupe (distress). Identify specific sub-species and false judgements.
Output: passions_detected (array of {id, name, root_passion}), false_judgements (array), correct_judgements (array)

MECHANISM 3 — OIKEIOSIS
Map the expanding circles of social obligation: self → household → community → citizens → humanity.
Output: relevant_circles (array of {stage, description, obligation_met}), deliberation_notes (string)

OVERALL: katorthoma_proximity (reflexive|habitual|deliberate|principled|sage_like), philosophical_reflection (2-3 sentences), improvement_path (which false judgement to address first).

Return ONLY valid JSON:
{
  "control_filter": {"within_prohairesis": [], "outside_prohairesis": []},
  "passion_diagnosis": {"passions_detected": [], "false_judgements": [], "correct_judgements": []},
  "oikeiosis": {"relevant_circles": [], "deliberation_notes": ""},
  "katorthoma_proximity": "",
  "philosophical_reflection": "",
  "improvement_path": "",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

export async function POST(request: NextRequest) {
  // Rate limiting (stricter for no-auth)
  const rateLimitError = checkRateLimit(request, EVALUATE_RATE_LIMIT)
  if (rateLimitError) return rateLimitError

  // No authentication required

  try {
    const startTime = Date.now()
    const { input } = await request.json()

    // Validate required input
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input is required. Provide the decision or action to evaluate.' },
        { status: 400 }
      )
    }

    // Shorter limit for demo endpoint (500 chars)
    const inputErr = validateTextLength(input, 'Input', 500)
    if (inputErr) return NextResponse.json({ error: inputErr }, { status: 400 })

    const userMessage = `Evaluate this decision through the Stoic core triad:

Input: ${input.trim()}

Return only the JSON evaluation object.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 768,
      temperature: 0.2,
      system: [{ type: 'text', text: DEMO_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [
        { role: 'user', content: userMessage }
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    let evalData
    try {
      const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
      evalData = JSON.parse(cleaned)
    } catch {
      console.error('evaluate: Failed to parse response:', responseText)
      return NextResponse.json(
        { error: 'Evaluation engine returned invalid response' },
        { status: 500 }
      )
    }

    // Validate core fields
    const required = ['control_filter', 'passion_diagnosis', 'oikeiosis', 'katorthoma_proximity']
    for (const field of required) {
      if (evalData[field] === undefined) {
        return NextResponse.json(
          { error: `Evaluation engine missing field: ${field}` },
          { status: 500 }
        )
      }
    }

    // Ensure disclaimer
    evalData.disclaimer = 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

    // Build envelope
    const envelope = buildEnvelope({
      result: evalData,
      endpoint: '/api/evaluate',
      model: 'claude-sonnet-4-6',
      startTime,
      maxTokens: 768,
      composability: {
        next_steps: ['/api/reason'],
        recommended_action: 'Sign up for an API key to access deeper analysis (standard: 5 mechanisms, deep: 6 mechanisms) and iterative deliberation chains.',
      },
    })

    return NextResponse.json(envelope, { headers: publicCorsHeaders() })
  } catch (error) {
    console.error('Evaluate API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight (public)
export async function OPTIONS() {
  return publicCorsPreflightResponse()
}
