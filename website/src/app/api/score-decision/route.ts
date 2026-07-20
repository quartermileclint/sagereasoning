import { NextRequest, NextResponse } from 'next/server'
// #5 + #10 (P-GL): log prod errors + degrade honestly on an LLM outage.
import { isLlmOutage, llmOutageResponse } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST } from '@/lib/model-config'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { runSageReason } from '@/lib/sage-reason-engine'
import { type RetrieveResult } from '@/lib/rag'
import { loadLayer1BlockWithFallback } from '@/lib/rag/load-layer1-block-with-fallback'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'

/**
 * sage-decide — Compare multiple decision options through Stoic virtue.
 *
 * Calls the shared sage-reason engine for each option, then ranks results
 * by katorthoma_proximity level.
 *
 * Unique to this endpoint:
 *   - Takes array of 2-5 decision options
 *   - Evaluates each option via sage-reason (standard depth)
 *   - Ranks results by proximity level
 *   - Generates per-option and overall receipts
 *
 * ---------------------------------------------------------------------------
 * CONTEXT LAYERS WIRED HERE:
 *   Layer 1 (Stoic Brain)        — loadLayer1BlockWithFallback(decision.trim(), 'standard', …)
 *                                  Pattern A1 (per ADR-001) under the α loop pattern (per
 *                                  ADR-002): one retrieve + one rerank + one format on the
 *                                  decision text; the same block string is passed to every
 *                                  iteration of the option-scoring loop. Falls back silently
 *                                  to the compiled getStoicBrainContext('standard') path on
 *                                  any retrieval error (the wrapper imports it).
 *   Layer 2 (Practitioner)       — getPractitionerContext(auth.user.id)
 *   Layer 3 (Project Context)    — getProjectContext('condensed')
 *   Loaded ONCE (parallel via Promise.all), reused across every option scored.
 *
 * WHY THIS SHAPE:
 *   Scoring N options shares the same user, the same project state, and the
 *   same Stoic Brain grounding (the decision's framing). Loading all three
 *   contexts once in parallel and passing them into each runSageReason call
 *   avoids N × load-latency. This matters most on decisions with 4-5 options.
 *   For Layer 1, the α loop pattern grounds retrieval in the decision text —
 *   option-blind, like the predecessor compiled-string path it replaces.
 *
 * WHAT BREAKS IF THE CONTEXT WIRING CHANGES:
 *   - If context is reloaded per-option, cold requests slow by ~3× on 5 options
 *   - If Layer 2 is dropped, options are ranked without personalisation —
 *     same ranking for every user given the same inputs. Loses the point of
 *     the endpoint for returning users.
 *   - If Layer 3 is dropped, ranking is ungrounded in project phase (this
 *     particularly matters for decisions about project direction).
 *   - If Layer 1 is moved out of the Promise.all and into the loop body,
 *     N retrievals fire per request — Direction β shape — increasing cold
 *     request latency by N × retrieval cost.
 *
 * DESIGN DECISIONS DOCUMENTED IN:
 *   - operations/handoffs/session-7d-layer1-layer2.md  (L1/L2 origin)
 *   - operations/session-handoffs/2026-04-15-layer3-wiring.md  (L3 wired here)
 *   - adopted/adr/2026-05-04-d6-d7-consumer-wiring.md  (ADR-001 — Pattern A1 spec)
 *   - adopted/adr/2026-05-04-d6-d7-loop-pattern-wiring.md  (ADR-002 — α loop pattern; this wiring)
 *   - operations/decision-log.md D-DECISION-RAG-WIRED-2026-05-04 (E7 wiring entry)
 */

interface PassionDetected {
  root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
  sub_species: string
  false_judgement: string
}

interface OptionScore {
  option: string
  katorthoma_proximity: KatorthomaProximityLevel
  passions_detected: PassionDetected[]
  is_kathekon: boolean
  kathekon_quality: 'strong' | 'moderate' | 'marginal' | 'contrary'
  stoic_insight: string
}

// POST — Score a decision with multiple options
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { decision, options, context, process: decisionProcess } = await request.json()

    if (!decision || typeof decision !== 'string' || decision.trim().length === 0) {
      return NextResponse.json({ error: 'decision is required' }, { status: 400 })
    }

    const decisionErr = validateTextLength(decision, 'Decision', TEXT_LIMITS.short)
    if (decisionErr) return NextResponse.json({ error: decisionErr }, { status: 400 })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })

    // R20a — Vulnerable user detection (before any LLM call)
    // enforceDistressCheck() returns a SafetyGate — compile-time proof that
    // the distress classifier has been awaited before any reasoning proceeds.
    const gate = await enforceDistressCheck(detectDistressTwoStage(decision))
    if (gate.shouldRedirect) {
      return NextResponse.json(
        { distress_detected: true, severity: gate.result.severity, redirect_message: gate.result.redirect_message },
        { status: 200, headers: corsHeaders() }
      )
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required (array of strings)' },
        { status: 400 }
      )
    }

    if (options.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 options allowed' },
        { status: 400 }
      )
    }

    // Domain context for decision evaluation
    // When a process description is provided (Item 10), include it for process quality assessment
    let domainContext = `This is a multi-option decision evaluation. Assess each option separately for its Stoic virtue alignment, then the results will be ranked by proximity level.`
    if (typeof decisionProcess === 'string' && decisionProcess.trim()) {
      domainContext += `\n\nDECISION PROCESS DESCRIPTION: ${decisionProcess.trim()}\n` +
        `In addition to evaluating each option, assess the QUALITY OF THE DECISION PROCESS itself. ` +
        `A well-identified set of options evaluated through a sound process scores higher than the same ` +
        `options arrived at through hasty elimination. In your response, include a "process_quality" field ` +
        `with value "thorough" (considered multiple angles, examined assumptions), "adequate" (reasonable but could be deeper), ` +
        `or "hasty" (eliminated options too quickly, missed perspectives). ` +
        `This maps to the Stoic concern with quality of assent — not just what you assent to, but how carefully you examined the impression.`
    }

    // Load Layer 1 (Stoic Brain via D6+D7+format), Layer 2 (Practitioner),
    // and Layer 3 (Project Context) once in parallel. α loop pattern per
    // ADR-002 — Layer 1 is grounded in the decision text and the same block
    // string is reused across every option's runSageReason call. ragCache is
    // declared per-request (KG1 rule 4 — never module-level).
    const ragCache = new Map<string, RetrieveResult>()
    const [stoicBrainContext, practitionerContext, projectContext] = await Promise.all([
      loadLayer1BlockWithFallback(decision.trim(), 'standard', ragCache, '/api/score-decision'),
      getPractitionerContext(auth.user.id),
      getProjectContext('condensed'),
    ])

    // Evaluate each option via sage-reason
    const scoreData: OptionScore[] = []
    for (let i = 0; i < options.length; i++) {
      const option = options[i].trim()
      const reasoningResult = await runSageReason({
        input: option,
        context,
        depth: 'standard',
        domain_context: domainContext,
        stoicBrainContext,
        practitionerContext,
        projectContext,
        applyMirrorPrinciple: true, // R19d (D-R19D-ALL-TOOLS 2026-06-07)
      })

      const evalData = reasoningResult.result as any
      scoreData.push({
        option,
        katorthoma_proximity: evalData.katorthoma_proximity,
        passions_detected: (evalData.passion_diagnosis?.passions_detected || []).map((p: any) => ({
          root_passion: p.root_passion || 'epithumia',
          sub_species: p.sub_species || p.name || p.id || 'unspecified',
          false_judgement: p.false_judgement || 'Unspecified',
        })),
        is_kathekon: evalData.kathekon_assessment?.is_kathekon ?? evalData.is_kathekon ?? false,
        kathekon_quality: evalData.kathekon_assessment?.quality || evalData.kathekon_quality || 'marginal',
        stoic_insight: evalData.philosophical_reflection || 'See detailed evaluation above.',
      })
    }

    // Sort by katorthoma_proximity level (sage_like > principled > deliberate > habitual > reflexive)
    const proximityRank: Record<KatorthomaProximityLevel, number> = {
      sage_like: 5,
      principled: 4,
      deliberate: 3,
      habitual: 2,
      reflexive: 1,
    }

    scoreData.sort((a, b) => proximityRank[b.katorthoma_proximity] - proximityRank[a.katorthoma_proximity])

    // Generate per-option receipts and an overall receipt
    const optionReceipts = scoreData.map((opt: OptionScore) =>
      extractReceipt({
        skillId: 'sage-decide',
        input: `${decision.trim()} — Option: ${opt.option}`,
        evalData: {
          katorthoma_proximity: opt.katorthoma_proximity,
          passions_detected: opt.passions_detected,
          is_kathekon: opt.is_kathekon,
          kathekon_quality: opt.kathekon_quality,
        },
        mechanisms: ['control_filter', 'passion_diagnosis', 'kathekon_assessment'],
      })
    )

    // Overall receipt from the top-ranked option
    const overallReceipt = extractReceipt({
      skillId: 'sage-decide',
      input: decision.trim(),
      evalData: {
        katorthoma_proximity: scoreData[0]?.katorthoma_proximity,
        passions_detected: scoreData.flatMap((o: OptionScore) => o.passions_detected),
        is_kathekon: scoreData[0]?.is_kathekon,
        kathekon_quality: scoreData[0]?.kathekon_quality,
      },
      mechanisms: ['control_filter', 'passion_diagnosis', 'kathekon_assessment'],
      recommendedNext: `Recommended option: ${scoreData[0]?.option || 'none'}`,
    })

    // Extract process quality from the first option's evaluation if process was described
    const processQuality = decisionProcess
      ? ((scoreData[0] as any)?.process_quality || 'not_assessed')
      : undefined

    const result = {
      decision: decision.trim(),
      options_scored: scoreData,
      recommended: scoreData[0]?.option || null,
      process_described: !!decisionProcess,
      process_quality: processQuality,
      scored_at: new Date().toISOString(),
      reasoning_receipt: overallReceipt,
      option_receipts: optionReceipts,
      disclaimer: 'Stoic decision evaluation is a reflective tool, not a directive. The sage recognizes that only virtue is truly good; external outcomes remain indifferent. Use this to examine your reasoning, not to escape responsibility for your choice.',
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'decision_score_v3',
        metadata: {
          num_options: options.length,
          top_proximity: scoreData[0]?.katorthoma_proximity,
          top_kathekon: scoreData[0]?.is_kathekon,
        },
      })
      .then(() => {})

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/score-decision',
      model: MODEL_FAST,
      startTime,
      maxTokens: 1536,
      composability: {
        next_steps: ['/api/score-iterate'],
        recommended_action: 'Review decision options and consider deeper analysis with /api/score-iterate.',
      },
    })

    return NextResponse.json(envelope, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Decision score API error:', error)
    const outage = isLlmOutage(error)
    logRouteError({ route: '/api/score-decision', method: 'POST', error, statusCode: outage ? 503 : 500, isLlmOutage: outage })
    if (outage) return llmOutageResponse()
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
