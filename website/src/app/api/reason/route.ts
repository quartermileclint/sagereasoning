import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { MODEL_FAST, MODEL_DEEP, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { extractReceipt, type MechanismId } from '@/lib/reasoning-receipt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// =============================================================================
// sage-reason — The Universal Reasoning Layer
//
// POST /api/reason
//
// Outcome: Run the Stoic core triad (or more) against any decision input.
//          Returns structured reasoning evaluation at the requested depth.
// Cost + Speed: 1 API call. ~2-4s depending on depth.
// Chains To: Any sage skill (as internal engine), any sage wrapper (as checkpoint).
//
// Depth parameter controls which mechanisms are applied:
//   quick    (3 mechanisms): Control Filter + Passion Diagnosis + Oikeiosis
//   standard (5 mechanisms): + Value Assessment + Appropriate Action
//   deep     (6 mechanisms): + Iterative Refinement
//
// The core triad (Control Filter + Passion Diagnosis + Oikeiosis) appears in
// 67% of all compliant original sage skills. sage-reason extracts this shared
// foundation so that skills become thin context templates on top of it.
//
// R3:  Disclaimer included in every response.
// R4:  System prompt is server-side only.
// R6a: Derived from V3 data files, not patched V1 structures.
// R6b: No independent virtue weights — unified assessment only.
// R6c: Qualitative proximity levels, not numeric 0-100.
// R6d: Passions are diagnostic (identifying false judgements), not punitive.
// R7:  All content traces to primary sources.
// R8a: API responses use Greek identifiers.
// =============================================================================

/**
 * Depth levels and their mechanisms.
 */
type ReasonDepth = 'quick' | 'standard' | 'deep'

const VALID_DEPTHS: ReasonDepth[] = ['quick', 'standard', 'deep']

/**
 * Map depth to the mechanisms included.
 */
const DEPTH_MECHANISMS: Record<ReasonDepth, string[]> = {
  quick: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
  standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
  deep: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
}

// =============================================================================
// SYSTEM PROMPTS — One per depth level (R4: server-side only, never exposed)
// =============================================================================

const QUICK_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. Apply the Stoic core triad to any decision and return structured JSON.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Identify what is within the agent's moral choice (eph' hemin: judgements, impulses, desires, aversions, character) and what is not. External outcomes are identified but not evaluated.

MECHANISM 2 — PASSION DIAGNOSIS
Which of the 4 root passions (epithumia/craving, hedone/irrational pleasure, phobos/fear, lupe/distress) distort reasoning? Identify false judgements and map them to the causal stage: impression (phantasia) → assent (synkatathesis) → impulse (horme) → action (praxis).

Root passions and sub-species:
- Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone: kelesis, epichairekakia, terpsis
- Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe: eleos, phthonos, zelotypia, penthos, achos

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
Map the 5 expanding circles of concern: self-preservation, household, local community, political community, humanity/cosmopolis. For each relevant circle, assess obligation status and tensions. Apply Cicero's 5 questions: Is it honourable? More honourable? Advantageous? More advantageous? (Honourable prevails.)

PROXIMITY ASSESSMENT (qualitative only):
- reflexive: impulse without deliberation
- habitual: convention without understanding
- deliberate: conscious reasoning with some understanding
- principled: stable commitment to virtue
- sage_like: perfected understanding and freedom from destructive passion

Return ONLY valid JSON — no markdown:
{
  "control_filter": {
    "within_prohairesis": ["..."],
    "outside_prohairesis": ["..."]
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "...", "name": "...", "root_passion": "..."}],
    "false_judgements": ["..."],
    "correct_judgements": ["..."],
    "causal_stage_affected": "phantasia|synkatathesis|horme|praxis"
  },
  "oikeiosis": {
    "relevant_circles": [{"stage": 1, "description": "...", "obligation_met": true|false|null, "tension": "..."|null}],
    "deliberation_notes": "..."
  },
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "philosophical_reflection": "...",
  "improvement_path": "...",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

const STANDARD_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. Apply 5 Stoic mechanisms to any decision and return structured JSON.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Identify what is within the agent's moral choice (eph' hemin: judgements, impulses, desires, aversions, character) and what is not.

MECHANISM 2 — PASSION DIAGNOSIS
Which of the 4 root passions (epithumia/craving, hedone/irrational pleasure, phobos/fear, lupe/distress) distort reasoning? Identify false judgements and map them to the causal stage: impression (phantasia) → assent (synkatathesis) → impulse (horme) → action (praxis).

Sub-species by root passion:
- Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone: kelesis, epichairekakia, terpsis
- Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe: eleos, phthonos, zelotypia, penthos, achos

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
Map the 5 expanding circles: self-preservation, household, local community, political community, humanity/cosmopolis. Assess obligation status and tensions. Apply Cicero's 5 questions where relevant.

MECHANISM 4 — VALUE ASSESSMENT (Preferred Indifferents)
Identify which preferred indifferents are at stake (Life, Health, Pleasure, Beauty, Strength, Wealth, Reputation, Noble birth, and negatives: Death, Disease, Pain, Ugliness) and whether the agent confuses them with genuine goods or treats indifferents as evils.

MECHANISM 5 — KATHEKON ASSESSMENT (Appropriate Action)
Is this action appropriate given natural relationships, reasonable justification, and role obligations?

ASSESSMENT (qualitative only, no numeric scores):
- katorthoma_proximity: reflexive | habitual | deliberate | principled | sage_like
- ruling_faculty_state: Description of disposition stability
- virtue_domains_engaged: Which of phronesis/dikaiosyne/andreia/sophrosyne
- philosophical_reflection: 2-3 sentences of Stoic reasoning
- improvement_path: Which false judgement to correct (frame as philosophical reflection)

Return ONLY valid JSON:
{
  "control_filter": {
    "within_prohairesis": ["..."],
    "outside_prohairesis": ["..."]
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "...", "name": "...", "root_passion": "..."}],
    "false_judgements": ["..."],
    "correct_judgements": ["..."],
    "causal_stage_affected": "..."
  },
  "oikeiosis": {
    "relevant_circles": [{"stage": 1, "description": "...", "obligation_met": true, "tension": null}],
    "deliberation_notes": "..."
  },
  "value_assessment": {
    "indifferents_at_stake": [{"name": "...", "axia": "high|moderate|low", "treated_as": "indifferent|good|evil"}],
    "value_error": "..."|null
  },
  "kathekon_assessment": {
    "is_kathekon": true,
    "quality": "strong|moderate|marginal|contrary",
    "justification": "..."
  },
  "katorthoma_proximity": "...",
  "ruling_faculty_state": "...",
  "virtue_domains_engaged": ["phronesis", "..."],
  "philosophical_reflection": "...",
  "improvement_path": "...",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

const DEEP_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. Apply all 6 Stoic mechanisms to any decision and return structured JSON. This is the deepest analysis available.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Identify what is within the agent's moral choice (eph' hemin: judgements, impulses, desires, aversions, character).

MECHANISM 2 — PASSION DIAGNOSIS
Which of the 4 root passions (epithumia, hedone, phobos, lupe) and their sub-species distort reasoning? Map to causal stage.

Sub-species:
- Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone: kelesis, epichairekakia, terpsis
- Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe: eleos, phthonos, zelotypia, penthos, achos

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
5 expanding circles of concern + Cicero's 5 deliberation questions.

MECHANISM 4 — VALUE ASSESSMENT (Preferred Indifferents)
12 preferred indifferents (high/moderate/low value): Life, Health, Pleasure, Beauty, Strength, Wealth, Reputation, Noble birth, and negatives (Death, Disease, Pain, Ugliness). Identify confusion with genuine goods.

MECHANISM 5 — KATHEKON ASSESSMENT (Appropriate Action)
Is this action appropriate given natural relationships, reasonable justification, and role obligations?

MECHANISM 6 — ITERATIVE REFINEMENT (Progress Tracking)
Assess progress along 4 dimensions: passion reduction (frequency, intensity, duration), judgement quality (consistency of testing impressions), disposition stability (virtue under pressure), oikeiosis extension (expanding circles of concern).

Senecan grades: pre_progress, grade_1, grade_2, grade_3. Direction of travel: improving | stable | declining.

ASSESSMENT (qualitative only):
- katorthoma_proximity: reflexive | habitual | deliberate | principled | sage_like
- ruling_faculty_state: Description of disposition stability
- virtue_domains_engaged: Which of phronesis/dikaiosyne/andreia/sophrosyne
- philosophical_reflection: 2-3 sentences of Stoic reasoning
- improvement_path: Which false judgement to correct (frame as philosophical reflection)

Return ONLY valid JSON:
{
  "control_filter": {
    "within_prohairesis": ["..."],
    "outside_prohairesis": ["..."]
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "...", "name": "...", "root_passion": "..."}],
    "false_judgements": ["..."],
    "correct_judgements": ["..."],
    "causal_stage_affected": "..."
  },
  "oikeiosis": {
    "relevant_circles": [{"stage": 1, "description": "...", "obligation_met": true, "tension": null}],
    "deliberation_notes": "..."
  },
  "value_assessment": {
    "indifferents_at_stake": [{"name": "...", "axia": "...", "treated_as": "..."}],
    "value_error": null
  },
  "kathekon_assessment": {
    "is_kathekon": true,
    "quality": "strong|moderate|marginal|contrary",
    "justification": "..."
  },
  "iterative_refinement": {
    "senecan_grade": "pre_progress|grade_1|grade_2|grade_3",
    "progress_dimensions": {
      "passion_reduction": "...",
      "judgement_quality": "...",
      "disposition_stability": "...",
      "oikeiosis_extension": "..."
    },
    "direction_of_travel": "improving|stable|declining"
  },
  "katorthoma_proximity": "...",
  "ruling_faculty_state": "...",
  "virtue_domains_engaged": ["phronesis", "..."],
  "philosophical_reflection": "...",
  "improvement_path": "...",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

// Map depth to system prompt, max tokens, and model
// Quick/standard use Haiku for speed; deep uses Sonnet for philosophical depth
const DEPTH_CONFIG: Record<ReasonDepth, { prompt: string; maxTokens: number; model: string }> = {
  quick: { prompt: QUICK_SYSTEM_PROMPT, maxTokens: 768, model: MODEL_FAST },
  standard: { prompt: STANDARD_SYSTEM_PROMPT, maxTokens: 1024, model: MODEL_FAST },
  deep: { prompt: DEEP_SYSTEM_PROMPT, maxTokens: 1536, model: MODEL_DEEP },
}

// Required fields per depth level (for response validation)
const REQUIRED_FIELDS: Record<ReasonDepth, string[]> = {
  quick: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
  standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
  deep: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
}

// =============================================================================
// EVALUATIVE DISCLAIMER — R3 required on every evaluation output
// =============================================================================

const EVALUATIVE_DISCLAIMER = 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

// =============================================================================
// POST /api/reason — Universal Reasoning Endpoint
// =============================================================================

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  // Authentication required
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { input, context, depth: requestedDepth, domain_context } = body

    // Validate required input
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input is required. Provide the decision, action, or situation to reason about.' },
        { status: 400 }
      )
    }

    // Validate text lengths
    const inputErr = validateTextLength(input, 'Input', TEXT_LIMITS.medium)
    if (inputErr) return NextResponse.json({ error: inputErr }, { status: 400 })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })
    const domainErr = validateTextLength(domain_context, 'Domain context', TEXT_LIMITS.medium)
    if (domainErr) return NextResponse.json({ error: domainErr }, { status: 400 })

    // Validate depth parameter
    const depth: ReasonDepth = requestedDepth || 'standard'
    if (!VALID_DEPTHS.includes(depth)) {
      return NextResponse.json(
        { error: `Invalid depth. Must be one of: ${VALID_DEPTHS.join(', ')}` },
        { status: 400 }
      )
    }

    const config = DEPTH_CONFIG[depth]

    // Build user message
    let userMessage = `Apply the Stoic reasoning mechanisms to the following input.

Input: ${input.trim()}`

    if (context?.trim()) {
      userMessage += `\nContext: ${context.trim()}`
    }

    if (domain_context?.trim()) {
      userMessage += `\n\nDOMAIN CONTEXT (this reasoning request is being made in the context of a specific domain):\n${domain_context.trim()}`
    }

    userMessage += '\n\nReturn only the JSON evaluation object.'

    // Check cache first
    const startTime = Date.now()
    const ck = cacheKey('/api/reason', { input: input.trim(), context: context?.trim(), domain_context: domain_context?.trim(), depth })
    const cached = cacheGet(ck)
    if (cached) {
      const responsePayload = {
        result: {
          ...(cached as Record<string, unknown>),
          disclaimer: EVALUATIVE_DISCLAIMER,
        },
        meta: {
          endpoint: '/api/reason',
          depth,
          mechanisms_applied: DEPTH_MECHANISMS[depth],
          mechanism_count: DEPTH_MECHANISMS[depth].length,
          ai_generated: true,
          ai_model: config.model,
          latency_ms: Date.now() - startTime,
        },
      }
      return NextResponse.json(responsePayload, { headers: corsHeaders() })
    }

    // Call the reasoning engine
    const message = await client.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: 0.2,
      system: [{ type: 'text', text: config.prompt, cache_control: { type: 'ephemeral' } }],
      messages: [
        { role: 'user', content: userMessage }
      ],
    })

    const latencyMs = Date.now() - startTime

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    let evalData
    try {
      const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
      evalData = JSON.parse(cleaned)
    } catch {
      console.error('sage-reason: Failed to parse response:', responseText)
      return NextResponse.json(
        { error: 'Reasoning engine returned invalid response' },
        { status: 500 }
      )
    }

    // Validate required fields for this depth
    const requiredFields = REQUIRED_FIELDS[depth]
    for (const field of requiredFields) {
      if (evalData[field] === undefined) {
        console.error(`sage-reason: Missing field '${field}' at depth '${depth}'`)
        return NextResponse.json(
          { error: `Reasoning engine missing field: ${field}` },
          { status: 500 }
        )
      }
    }

    // Generate reasoning receipt
    const receipt = extractReceipt({
      skillId: `sage-reason-${depth}`,
      input: input.trim(),
      evalData,
      mechanisms: DEPTH_MECHANISMS[depth] as MechanismId[],
    })

    // Add receipt to evaluation data
    evalData.reasoning_receipt = receipt

    // Cache the result
    cacheSet(ck, evalData)

    // Build response with metadata envelope (Task 2.2 compatible)
    const responsePayload = {
      result: {
        ...evalData,
        // R3: Ensure disclaimer is always present
        disclaimer: EVALUATIVE_DISCLAIMER,
      },
      meta: {
        endpoint: '/api/reason',
        depth,
        mechanisms_applied: DEPTH_MECHANISMS[depth],
        mechanism_count: DEPTH_MECHANISMS[depth].length,
        ai_generated: true,
        ai_model: config.model,
        latency_ms: latencyMs,
      },
    }

    return NextResponse.json(responsePayload, { headers: corsHeaders() })
  } catch (error) {
    console.error('sage-reason API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
