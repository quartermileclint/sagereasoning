import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
// #5 + #10 (P-GL): log prod errors + degrade honestly on an LLM outage.
import { isLlmOutage, llmOutageResponse } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST } from '@/lib/model-config'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { type RetrieveResult } from '@/lib/rag'
import { loadLayer1WithFallback } from '@/lib/rag/load-layer1-with-fallback'

/**
 * sage-score — Evaluate a single action through Stoic virtue principles.
 *
 * Uses the shared sage-reason engine (standard depth) with action-specific
 * domain context for passion and virtue assessment.
 *
 * Unique to this endpoint:
 *   - Input parsing for relationships, emotional_state, prior_feedback
 *   - Domain context construction for action scoring
 *   - Response envelope with composability hints
 *
 * ---------------------------------------------------------------------------
 * CONTEXT LAYERS WIRED HERE:
 *   Layer 1 (Stoic Brain)        — Loaded via D6 + D7 RAG retrieval per
 *                                   Sub-session E2 (Pattern A2; same shape as
 *                                   /api/reason quick-depth from Sub-session E1).
 *                                   Passages passed to engine as structured
 *                                   `retrievedPassages`; engine builds the system
 *                                   block. If retrieval fails, falls back to the
 *                                   compiled-string path via getStoicBrainContext('standard').
 *   Layer 2 (Practitioner)       — getPractitionerContext(auth.user.id)
 *                                   (requires auth; this endpoint is user-auth only)
 *   Layer 3 (Project Context)    — getProjectContext('condensed')
 *                                   (phase + recent decisions)
 *   Loaded in parallel (Promise.all), passed as params to runSageReason.
 *
 * WHY THIS SHAPE:
 *   Action-scoring benefits from personalisation (Layer 2 — this person's
 *   patterns) AND situational awareness (Layer 3 — current project phase
 *   when the action is project-related). Parallel loading keeps p95 latency
 *   bounded by the slowest of the three, not their sum.
 *
 * WHAT BREAKS IF THE CONTEXT WIRING CHANGES:
 *   - Drop Layer 2 → reasoning becomes generic, loses personalisation
 *   - Drop Layer 3 → reasoning loses "why this matters now" grounding
 *   - Change to sequential (await X; await Y; await Z) → ~3x slower on cold
 *     requests. Parallel is intentional.
 *   - If D6/D7 retrieval throws, the route falls back to the compiled string
 *     path; the user sees a successful response (with the prior Layer 1 content)
 *     instead of a 500. Failure is logged via console.warn.
 *
 * SUB-SESSION E2 (2026-05-04 — D6/D7 wired into Layer 1 at standard depth, Pattern A2):
 *   - Per-request `Map<string, RetrieveResult>` cache declared inside POST
 *     handler (KG1 rule 4 — never module-level).
 *   - Retrieval failure (RetrievalUnavailableError, EmbeddingFailureError,
 *     RetrievalTimeoutError, or any thrown error) falls back to the compiled
 *     stoic-brain-loader path. Logged via console.warn for Phase-2 observation.
 *   - See: /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
 *   - See: /operations/decision-log.md D-REASON-RAG-WIRED-2026-05-04 (E1 predecessor)
 *
 * SUB-SESSION E3 (2026-05-04 — Pattern S2 + S3 helper-lift):
 *   - loadLayer1WithFallback now imported from /lib/rag/load-layer1-with-fallback
 *     (was a route-local function duplicated from /api/reason; lifted because
 *     three+ consumers now share the same wrapper).
 *   - Mechanism-mapping helpers no longer imported from /api/reason/helpers
 *     (Pattern S1 retired); the /lib/rag/load-layer1-with-fallback module
 *     consumes them internally.
 *   - Behaviour unchanged — pure relocation. No regression risk; harness re-run
 *     proves Phase D still passes.
 *   - See: /operations/decision-log.md D-CONSUMER-WIRING-LIFT-2026-05-04
 *
 * DESIGN DECISIONS DOCUMENTED IN:
 *   - operations/handoffs/session-7d-layer1-layer2.md  (L1/L2 origin)
 *   - operations/session-handoffs/2026-04-15-layer3-wiring.md  (L3 wired here)
 *   - operations/handoffs/founder/2026-05-04-sub-session-E1-close.md (PR1 rollout begin)
 *   - operations/handoffs/founder/2026-05-XX-sub-session-E2-NEXT-SESSION-PROMPT.md (this wiring)
 */

/**
 * Normalize engine output to the structure score/page.tsx expects.
 *
 * The engine's system prompt defines katorthoma_proximity, ruling_faculty_state,
 * and virtue_domains_engaged as flat top-level fields, and oikeiosis as a nested
 * object. But the client reads virtue_quality.katorthoma_proximity (nested) and
 * oikeiosis_context (flat string). This function bridges the gap regardless of
 * which shape the LLM returns.
 */
function normalizeScoreResult(raw: Record<string, any>): Record<string, any> {
  const result = { ...raw }

  // 1. Ensure virtue_quality is a nested object
  if (!result.virtue_quality) {
    result.virtue_quality = {
      katorthoma_proximity: result.katorthoma_proximity || 'deliberate',
      ruling_faculty_state: result.ruling_faculty_state || '',
      virtue_domains_engaged: result.virtue_domains_engaged || [],
    }
    // Clean up flat fields so they don't confuse consumers
    delete result.katorthoma_proximity
    delete result.ruling_faculty_state
    delete result.virtue_domains_engaged
  }

  // 2. Ensure oikeiosis_context is a flat string
  if (!result.oikeiosis_context && result.oikeiosis) {
    if (typeof result.oikeiosis === 'string') {
      result.oikeiosis_context = result.oikeiosis
    } else if (result.oikeiosis.deliberation_notes) {
      result.oikeiosis_context = result.oikeiosis.deliberation_notes
    } else {
      result.oikeiosis_context = ''
    }
  }

  // 3. Ensure kathekon_assessment has required fields
  if (result.kathekon_assessment && result.kathekon_assessment.quality === undefined) {
    result.kathekon_assessment.quality = 'moderate'
  }

  return result
}

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

    // R20a — Vulnerable user detection (before any LLM call)
    // enforceDistressCheck() returns a SafetyGate — compile-time proof that
    // the distress classifier has been awaited before any reasoning proceeds.
    const gate = await enforceDistressCheck(detectDistressTwoStage(action))
    if (gate.shouldRedirect) {
      return NextResponse.json(
        { distress_detected: true, severity: gate.result.severity, redirect_message: gate.result.redirect_message },
        { status: 200, headers: corsHeaders() }
      )
    }

    // Build domain context from score-specific fields
    let domainContext = `This is an action evaluation request. Assess whether the action aligns with Stoic virtue principles.`
    if (relationships?.trim()) {
      domainContext += `\nRelationships involved: ${relationships.trim()}`
    }
    if (emotional_state?.trim()) {
      domainContext += `\nEmotional state: ${emotional_state.trim()}`
    }

    // Optional: prior_feedback for deliberation context
    if (prior_feedback && typeof prior_feedback === 'object') {
      const pf = prior_feedback as {
        previous_action?: string
        previous_proximity?: string
        passions_identified?: string[]
        false_judgements?: string[]
        sage_reflection?: string
      }
      if (pf.previous_action || pf.previous_proximity) {
        domainContext += `\n\nDELIBERATION CONTEXT (iterating on a previous action):
Previous action: ${pf.previous_action || 'not provided'}
Previous proximity level: ${pf.previous_proximity || 'not provided'}
Passions previously identified: ${pf.passions_identified?.join(', ') || 'none'}
False judgements previously identified: ${pf.false_judgements?.join('; ') || 'none'}
Sage reflection on previous action: ${pf.sage_reflection || 'not provided'}
Note: Evaluate the current action on its own merits, but acknowledge if it addresses previously identified passions and false judgements.`
      }
    }

    // Per-request cache for D6 retrievals (KG1 rule 4 — never module-level).
    const ragCache = new Map<string, RetrieveResult>()

    // Load Layer 1 (Stoic Brain via D6/D7), Layer 2 (practitioner context), and
    // Layer 3 (project context) in parallel to avoid sequential latency.
    const [layer1, practitionerContext, projectContext] = await Promise.all([
      loadLayer1WithFallback(action.trim(), 'standard', ragCache, '/api/score'),
      getPractitionerContext(auth.user.id),
      getProjectContext('condensed'),
    ])

    // Call the shared reasoning engine. layer1 spreads into either
    // retrievedPassages (success path) or stoicBrainContext (fallback path).
    const reasoningResult = await runSageReason({
      input: action.trim(),
      context,
      depth: 'standard',
      domain_context: domainContext,
      ...layer1,
      practitionerContext,
      projectContext,
      applyMirrorPrinciple: true, // R19d (D-R19D-ALL-TOOLS 2026-06-07)
    })

    // Normalize LLM output to match the structure score/page.tsx expects
    const normalized = normalizeScoreResult(reasoningResult.result as Record<string, any>)

    // Build response envelope with composability hints
    const envelope = buildEnvelope({
      result: normalized,
      endpoint: '/api/score',
      model: MODEL_FAST,
      startTime,
      maxTokens: 1024,
      composability: {
        next_steps: ['/api/score-iterate', '/api/reason'],
        recommended_action: normalized.virtue_quality?.katorthoma_proximity === 'reflexive' || normalized.virtue_quality?.katorthoma_proximity === 'habitual'
          ? 'Address the false judgements identified in passion_diagnosis, then re-evaluate with /api/score-iterate.'
          : 'Consider a deeper analysis with /api/reason?depth=deep for iterative refinement tracking.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Score API error:', error)
    const outage = isLlmOutage(error)
    logRouteError({ route: '/api/score', method: 'POST', error, statusCode: outage ? 503 : 500, isLlmOutage: outage })
    if (outage) return llmOutageResponse()
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
