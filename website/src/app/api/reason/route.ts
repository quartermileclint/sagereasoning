import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { MODEL_FAST, MODEL_DEEP, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'

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

const QUICK_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. You apply the Stoic core triad — 3 fundamental mechanisms — to any decision input and return structured JSON.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Separate what is within the agent's moral choice (prohairesis) from what is not. Only what is eph' hemin (up to us) — judgements, impulses, desires, aversions, character — is subject to evaluation. External outcomes are identified but not evaluated.
Output: within_prohairesis (array of strings), outside_prohairesis (array of strings)

MECHANISM 2 — PASSION DIAGNOSIS
Which passions, if any, are distorting the agent's reasoning? Use the 5-step diagnostic:
1. Was the impression of the situation distorted? By which root passion (epithumia/hedone/phobos/lupe)?
2. Did the agent assent to a false impression? What false belief drove the assent?
3. Did the impulse exceed what reason warranted?
4. Which specific sub-species was operative? (e.g., oknos/timidity, philoplousia/love of wealth)
5. What is the corresponding correct judgement?

The 4 root passions and their sub-species:
- Epithumia (Craving): orge/anger, eros/erotic passion, pothos/longing, philedonia/love of pleasure, philoplousia/love of wealth, philodoxia/love of honour
- Hedone (Irrational Pleasure): kelesis/enchantment, epichairekakia/malicious joy, terpsis/excessive amusement
- Phobos (Fear): deima/terror, oknos/timidity, aischyne/shame, thambos/dread, thorybos/panic, agonia/agony
- Lupe (Distress): eleos/pity, phthonos/envy, zelotypia/jealousy, penthos/grief, achos/anxiety

Output: passions_detected (array of {id, name, root_passion}), false_judgements (array of strings), correct_judgements (array of strings), causal_stage_affected (phantasia|synkatathesis|horme|praxis)

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
Map the expanding circles of concern relevant to this decision. The 5 stages:
1. Self-preservation and self-awareness
2. Household and immediate family
3. Local community and friends
4. Political community and fellow citizens
5. Humanity and cosmic fellowship (cosmopolis)

For each relevant circle, assess whether the obligation was met, neglected, or in tension with other circles.
Apply Cicero's 5 deliberation questions where relevant:
- Is the action honourable (honestum)?
- Is it advantageous (utile)?
- If honourable and advantageous conflict, which prevails? (Honourable always prevails.)
- Among honourable options, which is more honourable?
- Among advantageous options, which is more advantageous?

Output: relevant_circles (array of {stage, description, obligation_met: boolean|null, tension: string|null}), deliberation_notes (string)

OVERALL ASSESSMENT:
Based on the 3 mechanisms, provide:
- katorthoma_proximity: One of 5 qualitative levels (do NOT use numeric scores):
  "reflexive" — Pure impulse, no deliberation. Passion dominates.
  "habitual" — Convention/habit, not understanding. Externally appropriate but without knowledge.
  "deliberate" — Conscious reasoning. Some understanding. Passion partially checked.
  "principled" — Stable commitment to virtue. Strong understanding. Minimal passion.
  "sage_like" — Perfected understanding and unified virtue. Complete freedom from destructive passion.
- philosophical_reflection: 2-3 sentences of Stoic reasoning.
- improvement_path: Which false judgement to correct first. Frame as philosophical reflection, not prescription.

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
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

const STANDARD_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. You apply 5 Stoic mechanisms to any decision input and return structured JSON.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Separate what is within the agent's moral choice (prohairesis) from what is not. Only what is eph' hemin (up to us) — judgements, impulses, desires, aversions, character — is subject to evaluation. External outcomes are identified but not evaluated.
Output: within_prohairesis (array of strings), outside_prohairesis (array of strings)

MECHANISM 2 — PASSION DIAGNOSIS
Which passions, if any, are distorting the agent's reasoning? Use the 5-step diagnostic:
1. Was the impression of the situation distorted? By which root passion (epithumia/hedone/phobos/lupe)?
2. Did the agent assent to a false impression? What false belief drove the assent?
3. Did the impulse exceed what reason warranted?
4. Which specific sub-species was operative?
5. What is the corresponding correct judgement?

The 4 root passions and sub-species:
- Epithumia (Craving): orge, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone (Irrational Pleasure): kelesis, epichairekakia, terpsis
- Phobos (Fear): deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe (Distress): eleos, phthonos, zelotypia, penthos, achos

Output: passions_detected (array of {id, name, root_passion}), false_judgements (array), correct_judgements (array), causal_stage_affected

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
Map the 5 expanding circles of concern:
1. Self-preservation and self-awareness
2. Household and immediate family
3. Local community and friends
4. Political community and fellow citizens
5. Humanity and cosmic fellowship (cosmopolis)

Apply Cicero's 5 deliberation questions where relevant.
Output: relevant_circles (array of {stage, description, obligation_met, tension}), deliberation_notes

MECHANISM 4 — VALUE ASSESSMENT (Preferred Indifferents)
Evaluate which preferred indifferents are at stake and whether the agent is treating them correctly — as preferred but not as genuine goods. The 12 preferred indifferents (with selective value):
- Life (high), Health (high), Pleasure (moderate), Beauty (moderate), Strength (moderate)
- Wealth (moderate), Reputation (moderate), Noble birth (low)
- NEGATIVE: Death (high-), Disease (high-), Pain (moderate-), Ugliness (low-)

Is the agent confusing a preferred indifferent with a genuine good? Is the agent treating an indifferent as if it were a genuine evil?
Output: indifferents_at_stake (array of {name, axia, treated_as: "indifferent"|"good"|"evil"}), value_error (string|null describing any confusion)

MECHANISM 5 — KATHEKON ASSESSMENT (Appropriate Action)
Is this action a kathekon — an appropriate action for which a reasonable justification can be given?
- Does the action accord with the agent's natural relationships (oikeiosis)?
- Can a reasonable justification be given?
- Does it serve the roles the agent occupies?
Output: is_kathekon (boolean), quality ("strong"|"moderate"|"marginal"|"contrary"), justification (string)

OVERALL ASSESSMENT:
Based on all 5 mechanisms, provide:
- katorthoma_proximity: "reflexive"|"habitual"|"deliberate"|"principled"|"sage_like" (qualitative only, NO numeric scores)
- ruling_faculty_state: String describing the stability of the agent's disposition.
- virtue_domains_engaged: Which of phronesis/dikaiosyne/andreia/sophrosyne this decision engages.
- philosophical_reflection: 2-3 sentences of Stoic reasoning.
- improvement_path: Which false judgement to correct first. Frame as philosophical reflection.

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

const DEEP_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. You apply all 6 Stoic mechanisms to any decision input and return structured JSON. This is the deepest analysis available.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Separate what is within the agent's moral choice (prohairesis) from what is not. Only what is eph' hemin (up to us) — judgements, impulses, desires, aversions, character — is subject to evaluation.
Output: within_prohairesis (array), outside_prohairesis (array)

MECHANISM 2 — PASSION DIAGNOSIS
5-step diagnostic against 4 root passions (epithumia, hedone, phobos, lupe) and their 25 sub-species.
- Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone: kelesis, epichairekakia, terpsis
- Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe: eleos, phthonos, zelotypia, penthos, achos
Output: passions_detected (array of {id, name, root_passion}), false_judgements (array), correct_judgements (array), causal_stage_affected

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
5 expanding circles + Cicero's 5 deliberation questions.
Output: relevant_circles (array of {stage, description, obligation_met, tension}), deliberation_notes

MECHANISM 4 — VALUE ASSESSMENT (Preferred Indifferents)
12 preferred indifferents with selective value (axia): Life (high), Health (high), Pleasure (moderate), Beauty (moderate), Strength (moderate), Wealth (moderate), Reputation (moderate), Noble birth (low), Death (high-), Disease (high-), Pain (moderate-), Ugliness (low-).
Is the agent confusing preferred indifferents with genuine goods?
Output: indifferents_at_stake (array of {name, axia, treated_as}), value_error (string|null)

MECHANISM 5 — KATHEKON ASSESSMENT (Appropriate Action)
Is this a kathekon? Accord with natural relationships, reasonable justification, role fulfillment.
Output: is_kathekon (boolean), quality (strong|moderate|marginal|contrary), justification (string)

MECHANISM 6 — ITERATIVE REFINEMENT (Senecan Progress Tracking)
Where does the agent sit on the Senecan progress scale? This mechanism tracks direction-of-travel across 4 dimensions.

Senecan grades:
- Pre-progress: Not yet begun. Still fully in grip of passions.
- Grade 1 (proficiens): Has begun to move away from passions but still lapses frequently.
- Grade 2 (proficiens): Consistent reasoning, occasional lapse under pressure. False judgements identified but not always corrected.
- Grade 3 (proficiens): Near-sage. Rarely lapses. Correct judgements are becoming second nature.

Progress dimensions:
- Passion reduction: Are passions diminishing in frequency, intensity, and duration?
- Judgement quality: Are impressions being tested before assent more consistently?
- Disposition stability: Does the agent maintain virtue under pressure?
- Oikeiosis extension: Is concern expanding beyond self to wider circles?

Output: senecan_grade (pre_progress|grade_1|grade_2|grade_3), progress_dimensions ({passion_reduction, judgement_quality, disposition_stability, oikeiosis_extension} — each a brief assessment), direction_of_travel (improving|stable|declining)

OVERALL ASSESSMENT:
Based on all 6 mechanisms:
- katorthoma_proximity: "reflexive"|"habitual"|"deliberate"|"principled"|"sage_like" (qualitative only)
- ruling_faculty_state: String describing disposition stability.
- virtue_domains_engaged: Which of phronesis/dikaiosyne/andreia/sophrosyne.
- philosophical_reflection: 2-3 sentences of Stoic reasoning.
- improvement_path: Which false judgement to correct first. Frame as philosophical reflection.

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
