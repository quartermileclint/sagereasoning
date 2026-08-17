import Anthropic from '@anthropic-ai/sdk'
// #5 + #10 (P-GL): log prod errors + degrade honestly on an LLM outage.
import { isLlmOutage, llmOutageResponse } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, requireAuth, validateTextLength, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { enforceDistressCheck } from '@/lib/constraints'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import {
  isR20aGapClosureEnabled,
  composeDistressSubject,
  buildMildSupportResources,
} from '@/lib/r20a-gap-closure'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { extractJSON } from '@/lib/json-utils'
import { supabaseAdmin } from '@/lib/supabase-server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})


/**
 * POST /api/evaluate — authenticated quick-evaluation endpoint
 *
 * ⚠ WAS a no-auth public demo until 2026-08-18. Gated by binding mentor ruling
 * (see the block inside POST for the full reasoning and the verbatim record).
 * The "no signup, no API key" framing below is HISTORICAL and is retained only
 * so the change is legible; it no longer describes the route.
 *
 * Outcome: Returns a quick-depth (core triad) evaluation of a decision input,
 *          to an AUTHENTICATED practitioner. Screened by the R20a perimeter.
 * Cost + Speed: ~2s. Rate-limited at the stricter setting inherited from its
 *          unauthenticated period, deliberately.
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

MIRROR PRINCIPLE (R19d): This evaluation is a mirror for the submitter's own reasoning, not a lens for judging others. The framework is for examining one's own judgements — the only thing within one's control. If the submitted input is really an attempt to score, diagnose, or pathologise another identifiable person's character, passions, or reasoning rather than the submitter's own action, evaluate only the reasoning expressed in the input and note that applying this framework to judge another person without their knowledge and consent is a misapplication, however internally consistent it seems. Never use Stoic or philosophical language to invalidate any real person's feelings or reasoning.

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
  // Rate limiting (retained from the pre-gating configuration — see below)
  const rateLimitError = checkRateLimit(request, EVALUATE_RATE_LIMIT)
  if (rateLimitError) return rateLimitError

  // ── AUTHENTICATION — ADDED 2026-08-18 BY BINDING MENTOR RULING ────────────
  //
  // This route was UNAUTHENTICATED. It accepted free text from anonymous
  // visitors and returned a katorthoma_proximity rating, a philosophical
  // reflection and an improvement path, with no distress screening of any kind.
  //
  // It was invisible to six consecutive passes over the perimeter — five by
  // hand, one by the automated sweep — because every one of them assumed a
  // human-facing surface is an authenticated surface. It was found only when
  // the sweep's own predicate was tested for that assumption.
  //
  // THE RULING (2026-08-18-mentor-ruling-unauthenticated-public-surface-
  // verbatim.md) resolved the B3 asymmetry argument toward REMOVING the surface
  // from public availability rather than adding it to the perimeter — the first
  // time B3 has resolved that way:
  //
  //   "A Stoic evaluation returned to an anonymous person in crisis is not
  //    neutral. A proximity rating and an improvement path, returned to someone
  //    who has typed the worst thing in their life into an evaluator, is a
  //    response that presupposes the person is in a position to receive
  //    philosophical guidance. That presupposition may be false in exactly the
  //    cases where it matters most."
  //
  // Gating was the ruling's FIRST preference, with retirement as the fallback
  // "if gating is not immediately tractable". Tractability was checked
  // first-hand: this route is absent from llms.txt, agent-card.json and
  // api-docs (NOT a published R18 contract) and no UI page calls it. Its only
  // coupling was a next_steps hint in /api/skills, updated in the same change.
  //
  // ⚠ DO NOT REVERT THIS TO AN UNAUTHENTICATED DEMO. The ruling anticipated the
  // argument: "If the demo purpose requires unauthenticated access, that purpose
  // should be reconsidered — a demo that requires no account is a demo that
  // cannot support anyone it reaches."
  //
  // The rate limit above is deliberately left at its stricter no-auth setting.
  // It costs an authenticated caller nothing, and loosening it is a separate
  // decision from the one this ruling made.
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { input } = await request.json()

    // ── R20a perimeter (AC5; added 2026-08-18, in the SAME change as gating) ──
    // The ruling is explicit that screening an UNAUTHENTICATED endpoint was NOT
    // an acceptable standalone fix — "the screening would be doing the minimum
    // while the more important question goes unanswered." Screening becomes
    // appropriate only once the surface is authenticated, at which point it is
    // added "on the same terms as the five score routes it twins", which is
    // what this is. Runs before field validation and before the LLM call.
    let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
    if (isR20aGapClosureEnabled()) {
      const gate = await enforceDistressCheck(detectDistressTwoStage(composeDistressSubject([input])))
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

    // Analytics: evaluate_demo_started (no PII in payload)
    supabaseAdmin.from('analytics_events').insert({
      event_type: 'evaluate_demo_started',
      metadata: { input_length: input.trim().length },
    }).then(() => {}) // Fire-and-forget — never block the demo flow

    // Context layers (public endpoint — Stoic Brain only, no project/brain/environmental context)
    const stoicBrainContext = getStoicBrainContext('quick')

    const userMessage = `Evaluate this decision through the Stoic core triad:

Input: ${input.trim()}

Return only the JSON evaluation object.`

    // Check cache first
    const ck = cacheKey('/api/evaluate', { input: input.trim() })
    const cached = cacheGet(ck)
    if (cached) {
      const envelope = buildEnvelope({
        result: cached,
        endpoint: '/api/evaluate',
        model: MODEL_FAST,
        startTime,
        maxTokens: 2048,
        composability: {
          next_steps: ['/api/reason'],
          recommended_action: 'Sign up for an API key to access deeper analysis (standard: 5 mechanisms, deep: 6 mechanisms) and iterative deliberation chains.',
        },
      })
      // Analytics: cache hit still counts as completed demo
      supabaseAdmin.from('analytics_events').insert({
        event_type: 'evaluate_demo_completed',
        metadata: {
          input_length: input.trim().length,
          latency_ms: Date.now() - startTime,
          from_cache: true,
        },
      }).then(() => {})

      // The mild fold rides the CACHE-HIT path too. The cache is keyed on the
      // input, so a mild-severity input that has been seen before still reaches
      // this branch — omitting it here would drop crisis resources for exactly
      // the second and subsequent practitioners to write the same thing.
      return NextResponse.json(
        mildSupport ? { ...envelope, support_resources: mildSupport } : envelope,
        { headers: publicCorsHeaders() }
      )
    }

    const message = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 2048,
      temperature: 0.2,
      system: [
        { type: 'text', text: DEMO_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: stoicBrainContext },
      ],
      messages: [
        { role: 'user', content: userMessage }
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response using shared extraction utility
    let evalData
    try {
      evalData = extractJSON(responseText)
    } catch (parseErr) {
      console.error('evaluate: Failed to parse response:', parseErr instanceof Error ? parseErr.message : parseErr)
      return NextResponse.json(
        { error: 'Evaluation engine returned invalid response' },
        { status: 500 }
      )
    }

    // Validate core mechanism fields (hard requirement — useless without these)
    const requiredMechanisms = ['control_filter', 'passion_diagnosis', 'oikeiosis']
    for (const field of requiredMechanisms) {
      if (evalData[field] === undefined) {
        return NextResponse.json(
          { error: `Evaluation engine missing field: ${field}` },
          { status: 500 }
        )
      }
    }

    // Default summary fields if LLM omitted them (don't crash the demo for these)
    if (!evalData.katorthoma_proximity) {
      evalData.katorthoma_proximity = 'undetermined'
    }
    if (!evalData.philosophical_reflection) {
      evalData.philosophical_reflection = 'The evaluation engine was unable to generate a philosophical reflection for this input.'
    }
    if (!evalData.improvement_path) {
      evalData.improvement_path = 'Review the passion diagnosis above to identify which false judgement to address first.'
    }

    // Ensure disclaimer
    evalData.disclaimer = 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

    // Cache the result
    cacheSet(ck, evalData)

    // Build envelope
    const envelope = buildEnvelope({
      result: evalData,
      endpoint: '/api/evaluate',
      model: MODEL_FAST,
      startTime,
      maxTokens: 2048,
      composability: {
        next_steps: ['/api/reason'],
        recommended_action: 'Sign up for an API key to access deeper analysis (standard: 5 mechanisms, deep: 6 mechanisms) and iterative deliberation chains.',
      },
    })

    // Analytics: evaluate_demo_completed (no PII — proximity level only)
    supabaseAdmin.from('analytics_events').insert({
      event_type: 'evaluate_demo_completed',
      metadata: {
        input_length: input.trim().length,
        katorthoma_proximity: evalData.katorthoma_proximity || 'unknown',
        latency_ms: Date.now() - startTime,
        from_cache: false,
      },
    }).then(() => {}) // Fire-and-forget

    return NextResponse.json(
      mildSupport ? { ...envelope, support_resources: mildSupport } : envelope,
      { headers: publicCorsHeaders() }
    )
  } catch (error) {
    console.error('Evaluate API error:', error)

    // Analytics: evaluate_demo_error (no PII — error type only)
    supabaseAdmin.from('analytics_events').insert({
      event_type: 'evaluate_demo_error',
      metadata: {
        error_type: error instanceof Error ? error.constructor.name : 'unknown',
      },
    }).then(() => {}) // Fire-and-forget

    const outage = isLlmOutage(error)
    logRouteError({ route: '/api/evaluate', method: 'POST', error, statusCode: outage ? 503 : 500, isLlmOutage: outage })
    if (outage) return llmOutageResponse()
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
