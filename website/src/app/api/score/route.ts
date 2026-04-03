import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { extractReceipt } from '@/lib/reasoning-receipt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * V3 Scoring Prompt — derived from scoring.json evaluation_sequence.
 *
 * Implements the 4-stage evaluation sequence:
 *   Stage 1: Prohairesis Filter (control_filter)
 *   Stage 2: Kathekon Assessment (appropriate action)
 *   Stage 3: Passion Diagnosis (identify false judgements)
 *   Stage 4: Unified Virtue Assessment (katorthoma proximity)
 *
 * R4: This prompt is server-side only. Never exposed in API responses or client bundles.
 * R6b: No independent virtue weights — unified assessment only.
 * R6c: Qualitative proximity levels, not numeric 0-100.
 * R6d: Passions are diagnostic (identifying false judgements), not punitive.
 */
const SYSTEM_PROMPT = `You are the Stoic evaluation engine for sagereasoning.com. Evaluate human actions through Stoic virtue and the dichotomy of control.

CORE PRINCIPLES:
- Dichotomy of Control: Only judgements, impulses, desires, aversions, and character (eph' hemin) are within control. External outcomes are not.
- Unified Virtue: The four cardinal virtues are inseparable expressions of practical wisdom.
- Qualitative Assessment: Use the 5 proximity levels (reflexive, habitual, deliberate, principled, sage_like), not numeric scores.

EVALUATION MECHANISMS:

PROHAIRESIS FILTER — Separate what is within the agent's moral choice from what is not.

KATHEKON ASSESSMENT — Is this action appropriate? Consider natural relationships (oikeiosis), reasonable justification, and role obligations.

PASSION DIAGNOSIS — Identify which of the 4 root passions (epithumia/craving, hedone/irrational pleasure, phobos/fear, lupe/distress) distort reasoning. Map false judgements to the causal stage affected: impression (phantasia) → assent (synkatathesis) → impulse (horme) → action (praxis).

Key sub-species:
- Epithumia: orge/anger, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone: kelesis, epichairekakia, terpsis
- Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe: eleos, phthonos, zelotypia, penthos, achos

UNIFIED VIRTUE ASSESSMENT — Assess closeness to the sage ideal through the ruling faculty (hegemonikon):
- Phronesis: Clear perception of the situation
- Dikaiosyne: Giving each affected person their due
- Andreia: Right action despite difficulty
- Sophrosyne: Freedom from excessive impulse

Proximity levels (movement toward sage ideal):
- reflexive: impulse without deliberation
- habitual: convention without understanding
- deliberate: conscious reasoning with some understanding
- principled: stable commitment to virtue
- sage_like: perfected understanding and complete freedom from destructive passion

OUTPUTS REQUIRED:
- improvement_path: Which false judgement to correct and which passion to address (frame as philosophical reflection)
- oikeiosis_context: Which social obligations (self → household → community → humanity → cosmic) were relevant
- philosophical_reflection: 2-3 sentences of Stoic reasoning

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "control_filter": {
    "within_prohairesis": ["<string>", ...],
    "outside_prohairesis": ["<string>", ...]
  },
  "kathekon_assessment": {
    "is_kathekon": <boolean>,
    "quality": "<strong|moderate|marginal|contrary>"
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "<sub-species id>", "name": "<display name>", "root_passion": "<epithumia|hedone|phobos|lupe>"}],
    "false_judgements": ["<specific false belief>", ...],
    "causal_stage_affected": "<phantasia|synkatathesis|horme|praxis>"
  },
  "virtue_quality": {
    "katorthoma_proximity": "<reflexive|habitual|deliberate|principled|sage_like>",
    "ruling_faculty_state": "<string describing stability of disposition>",
    "virtue_domains_engaged": ["<phronesis|dikaiosyne|andreia|sophrosyne>", ...]
  },
  "improvement_path": "<which false judgement to correct and which passion to address>",
  "oikeiosis_context": "<which social obligations were relevant and whether met>",
  "philosophical_reflection": "<2-3 sentences of Stoic reasoning>",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  // Authentication required
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { action, context, relationships, emotional_state, prior_feedback } = await request.json()

    if (!action || action.trim().length === 0) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Text length limits
    const actionErr = validateTextLength(action, 'Action', TEXT_LIMITS.short)
    if (actionErr) return NextResponse.json({ error: actionErr }, { status: 400 })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })

    // Optional: prior_feedback for deliberation context
    let priorFeedbackBlock = ''
    if (prior_feedback && typeof prior_feedback === 'object') {
      const pf = prior_feedback as {
        previous_action?: string
        previous_proximity?: string
        passions_identified?: string[]
        false_judgements?: string[]
        sage_reflection?: string
      }
      if (pf.previous_action || pf.previous_proximity) {
        priorFeedbackBlock = `\n\nDELIBERATION CONTEXT (iterating on a previous action):
Previous action: ${pf.previous_action || 'not provided'}
Previous proximity level: ${pf.previous_proximity || 'not provided'}
Passions previously identified: ${pf.passions_identified?.join(', ') || 'none'}
False judgements previously identified: ${pf.false_judgements?.join('; ') || 'none'}
Sage reflection on previous action: ${pf.sage_reflection || 'not provided'}
Note: Evaluate the current action on its own merits, but acknowledge if it addresses previously identified passions and false judgements.`
      }
    }

    const userMessage = `Please evaluate the following action through the 4-stage Stoic evaluation sequence.

Action: ${action.trim()}
${context?.trim() ? `Context: ${context.trim()}` : ''}
${relationships?.trim() ? `Relationships involved: ${relationships.trim()}` : ''}
${emotional_state?.trim() ? `Emotional state: ${emotional_state.trim()}` : ''}${priorFeedbackBlock}

Return only the JSON evaluation object.`

    // Check cache first
    const ck = cacheKey('/api/score', { action: action.trim(), context: context?.trim(), relationships: relationships?.trim(), emotional_state: emotional_state?.trim(), prior_feedback })
    const cached = cacheGet(ck)
    if (cached) {
      const envelope = buildEnvelope({
        result: cached,
        endpoint: '/api/score',
        model: MODEL_FAST,
        startTime,
        maxTokens: 1024,
        composability: {
          next_steps: ['/api/score-iterate', '/api/reason'],
          recommended_action: (cached as any).virtue_quality?.katorthoma_proximity === 'reflexive' || (cached as any).virtue_quality?.katorthoma_proximity === 'habitual'
            ? 'Address the false judgements identified in passion_diagnosis, then re-evaluate with /api/score-iterate.'
            : 'Consider a deeper analysis with /api/reason?depth=deep for iterative refinement tracking.',
        },
      })
      return NextResponse.json(envelope, { headers: corsHeaders() })
    }

    const message = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 1024,
      temperature: 0.2,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [
        { role: 'user', content: userMessage }
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response
    let evalData
    try {
      const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
      evalData = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse evaluation response:', responseText)
      return NextResponse.json({ error: 'Evaluation engine returned invalid response' }, { status: 500 })
    }

    // Validate required V3 fields
    const required = [
      'control_filter', 'kathekon_assessment', 'passion_diagnosis',
      'virtue_quality', 'improvement_path', 'philosophical_reflection',
    ]
    for (const field of required) {
      if (evalData[field] === undefined) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 500 })
      }
    }

    // R3: Ensure disclaimer is always present
    evalData.disclaimer = 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

    // Generate reasoning receipt
    const receipt = extractReceipt({
      skillId: 'sage-score',
      input: action.trim(),
      evalData,
      mechanisms: ['control_filter', 'kathekon_assessment', 'passion_diagnosis', 'oikeiosis'],
    })
    evalData.reasoning_receipt = receipt

    // Cache the result
    cacheSet(ck, evalData)

    // Build response with metadata envelope (Task 2.2)
    const envelope = buildEnvelope({
      result: evalData,
      endpoint: '/api/score',
      model: MODEL_FAST,
      startTime,
      maxTokens: 1024,
      composability: {
        next_steps: ['/api/score-iterate', '/api/reason'],
        recommended_action: evalData.virtue_quality?.katorthoma_proximity === 'reflexive' || evalData.virtue_quality?.katorthoma_proximity === 'habitual'
          ? 'Address the false judgements identified in passion_diagnosis, then re-evaluate with /api/score-iterate.'
          : 'Consider a deeper analysis with /api/reason?depth=deep for iterative refinement tracking.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
