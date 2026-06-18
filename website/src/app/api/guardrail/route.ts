import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  meetsThreshold,
  getV3Recommendation,
  type V3GuardrailResponse,
} from '@/lib/guardrails'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, validateApiKey, withUsageHeaders, validateTextLength, TEXT_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import {
  createLoopAccumulator,
  extractLoopId,
  generateLoopId,
  finalizeLoopResponse,
  estimateCallCostCents,
} from '@/lib/loop-cost-tracker'
import { extractReceipt, type MechanismId } from '@/lib/reasoning-receipt'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getProjectContext } from '@/lib/context/project-context'
import { MODEL_DEEP } from '@/lib/model-config'
import {
  runGuardrailSandwich,
  isGuardrailSandwichEnabled,
} from '@/lib/guardrail-sandwich'

/**
 * sage-guard — Binary safety gate for AI agent actions.
 *
 * Uses the shared sage-reason engine (quick depth for speed) to evaluate
 * whether an action meets a Stoic virtue threshold before executing.
 *
 * ---------------------------------------------------------------------------
 * CONTEXT LAYERS WIRED HERE:
 *   Layer 1 (Stoic Brain)        — getStoicBrainContext(evaluationDepth)
 *   Layer 2 (Practitioner)       — NOT APPLICABLE. This endpoint uses
 *                                   validateApiKey only (agent-facing); there
 *                                   is no user session, so no userId to load
 *                                   practitioner context for.
 *   Layer 3 (Project Context)    — getProjectContext('minimal')
 *                                   ('minimal' = identity + ethical commitments
 *                                    only; a safety gate does NOT need project
 *                                    phase or tensions.)
 *
 * WHY 'MINIMAL' NOT 'CONDENSED':
 *   A safety gate's job is threshold evaluation against ethical commitments.
 *   Phase-of-project detail (in 'condensed') would pollute the evaluation
 *   without improving it. 'minimal' gives the gate what it needs: who
 *   SageReasoning is and what commitments it holds.
 *
 * ACCEPTED RISK (agent-facing endpoint):
 *   External agents calling this endpoint will receive SageReasoning's
 *   identity + ethical commitments on every call. This is mild IP exposure
 *   (R4) and may pollute their reasoning context slightly. Accepted per
 *   founder decision on 15 April 2026. Revisit at P3 (Sage Assent)
 *   when agent-context boundaries are designed more broadly.
 *
 * WHAT BREAKS IF CONTEXT CHANGES:
 *   - Change to 'condensed' → external agents get SageReasoning project
 *     phase and tensions in every guardrail call. Unwanted leak.
 *   - Drop Layer 3 entirely → loses ethical-commitment grounding on safety
 *     evaluations for actions involving SageReasoning's operations
 *   - Attempt to add Layer 2 → will fail at auth.user.id access (there is
 *     no auth.user object on this endpoint)
 *
 * DESIGN DECISIONS DOCUMENTED IN:
 *   - operations/handoffs/session-7d-layer1-layer2.md  (L1/L2 origin)
 *   - operations/session-handoffs/2026-04-15-layer3-wiring.md
 *     (L3 'minimal' wired here; agent-facing accepted risk; Layer 2
 *     correction — was incorrectly flagged as a "gap" in the hold
 *     point assessment)
 * ---------------------------------------------------------------------------
 *
 * Unique to this endpoint:
 *   - Uses quick depth (3 mechanisms, Haiku model) for speed
 *   - API-key authentication (not user auth)
 *   - Binary proceed/proceed_with_caution decision
 *   - Threshold comparison against proximity level
 *   - Usage tracking per API key
 */

const V3_DISCLAIMER = 'This assessment is based on V3 virtue evaluation. Results reflect the agent\'s action\'s alignment with Stoic virtue principles at a specific moment. No assessment is final; agents should exercise practical wisdom in decision-making.'

// POST — Check an action against Stoic virtue guardrails before executing
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const keyCheck = await validateApiKey(request, 'guardrail')
  if (!keyCheck.valid) return keyCheck.error

  // M4 CI-10 (2026-06-13): gate loop metering. Flag-gated — UNSET in production
  // = today's behaviour (no loop_billing_events row, no X-Loop-* headers). The
  // CI-8 meta cost honesty below is NOT flag-gated: it always retires the stale
  // competitor-anchored $0.0025. KG1: the metering write goes through
  // finalizeLoopResponse (awaited; no fire-and-forget; no self-call).
  const ci10LoopMeteringEnabled = process.env.SUBSTRATE_GATE_LOOP_METERING_ENABLED === 'true'
  const loopId = ci10LoopMeteringEnabled
    ? (extractLoopId(request) ?? generateLoopId())
    : null

  try {
    const startTime = Date.now()
    const { action, context, threshold = 'deliberate', agent_id, risk_class, urgency_context, considered_alternatives } = await request.json()

    // CI-10: per-request loop accumulator (KG1 rule 4 — closure state, never
    // module-level). Null when metering is disabled.
    const loopAccumulator = ci10LoopMeteringEnabled && loopId
      ? createLoopAccumulator({
          loopId,
          apiKeyId: keyCheck.api_key_id,
          surface: 'api_guardrail',
          agentId: typeof agent_id === 'string' ? agent_id : null,
        })
      : null

    if (!action || typeof action !== 'string' || action.trim().length === 0) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    // Validate risk_class if provided (Standard / Elevated / Critical)
    const validRiskClasses = ['standard', 'elevated', 'critical'] as const
    type RiskClass = typeof validRiskClasses[number]
    const resolvedRiskClass: RiskClass = (
      typeof risk_class === 'string' && validRiskClasses.includes(risk_class.toLowerCase() as RiskClass)
    ) ? (risk_class.toLowerCase() as RiskClass) : 'standard'

    // Map risk_class to evaluation depth (per project instructions 0d-ii)
    // Standard → quick (3 mechanisms), Elevated → standard (5), Critical → deep (6)
    const riskDepthMap: Record<RiskClass, 'quick' | 'standard' | 'deep'> = {
      standard: 'quick',
      elevated: 'standard',
      critical: 'deep',
    }
    const evaluationDepth = riskDepthMap[resolvedRiskClass]

    const actionErr = validateTextLength(action, 'action', TEXT_LIMITS.medium)
    if (actionErr) {
      return NextResponse.json({ error: actionErr }, { status: 400 })
    }

    if (context) {
      const contextErr = validateTextLength(context, 'context', TEXT_LIMITS.medium)
      if (contextErr) {
        return NextResponse.json({ error: contextErr }, { status: 400 })
      }
    }

    // Validate threshold is a valid proximity level
    const validProximityLevels: KatorthomaProximityLevel[] = [
      'reflexive',
      'habitual',
      'deliberate',
      'principled',
      'sage_like',
    ]
    const thresholdLevel = (typeof threshold === 'string' && validProximityLevels.includes(threshold as KatorthomaProximityLevel))
      ? (threshold as KatorthomaProximityLevel)
      : 'deliberate'

    // ========================================================================
    // #3b/#3c (ADR-009, 2026-06-19): port to the signed deterministic sandwich.
    // SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED UNSET (default, production) ⇒ this
    // branch is SKIPPED and the verbatim legacy sage-guard path below runs
    // (byte-identical — test-asserted). Flag ON ⇒ one bounded Layer-1 extraction
    // (Sonnet, 4000 tok) + free deterministic Layer-2 verdict + Ed25519 signature,
    // NO Layer-3 prose. The verdict/threshold semantics are unchanged
    // (meetsThreshold/getV3Recommendation over katorthoma_proximity); only the
    // SOURCE of proximity changes (LLM → deterministic Layer 2). See
    // guardrail-sandwich.ts + ADR-009. R20a: no A7 gate here — the guardrail
    // stays OUTSIDE the human-distress perimeter (ADR-009 §6).
    // ========================================================================
    if (isGuardrailSandwichEnabled()) {
      const sandwichDomainContext = `This is a ${resolvedRiskClass}-risk agent action safety-gate evaluation.`
      const outcome = await runGuardrailSandwich({
        action: action.trim(),
        context: typeof context === 'string' ? context : undefined,
        urgency_context: typeof urgency_context === 'string' ? urgency_context.trim() : undefined,
        domain_context: sandwichDomainContext,
        threshold: thresholdLevel,
      })

      // Signing fail-CLOSED → 503 (never emit an unsigned assessment when signing
      // is enabled; mirrors /api/reason). No metering — no verdict produced.
      if (outcome.status === 'signing_unavailable') {
        return NextResponse.json(
          { error: 'substrate_signing_unavailable' },
          { status: 503, headers: { ...publicCorsHeaders() } },
        )
      }

      // Request-side fields — IDENTICAL logic to the legacy path (pure
      // request-derived; no engine dependence).
      const consideredAlternativesProvided = Array.isArray(considered_alternatives)
        ? considered_alternatives.length
        : undefined
      let alternativesWarning: string | undefined
      if (resolvedRiskClass === 'critical' && urgency_context) {
        if (!considered_alternatives || (Array.isArray(considered_alternatives) && considered_alternatives.length === 0)) {
          alternativesWarning = 'HASTY ASSENT RISK: This is a Critical action taken under urgency with no alternatives considered. The auth middleware incident pattern applies. Consider what other approaches could achieve the same goal.'
        } else if (Array.isArray(considered_alternatives) && considered_alternatives.length === 1) {
          alternativesWarning = 'Only one alternative was considered for a Critical action under urgency. Consider whether additional options exist.'
        }
      }

      // The ONE LLM call's usage (the Layer-1 extraction); null on engine failure.
      let gateUsage: { input_tokens: number; output_tokens: number } | null = null
      let resultBody: Record<string, unknown>

      if (outcome.status === 'engine_unavailable') {
        // Layer-1/Layer-2 failure → CONSERVATIVE fallback. A gate NEVER silently
        // "proceeds" on engine failure (ADR-009 §5). 200, not metered.
        resultBody = {
          proceed: false,
          katorthoma_proximity: null,
          threshold: thresholdLevel,
          recommendation: 'pause_for_review',
          passions_detected: [],
          reasoning: 'The reasoning engine could not evaluate this action; the gate fails safe (no proceed).',
          disclaimer: V3_DISCLAIMER,
          risk_class: resolvedRiskClass,
          evaluation_depth: 'deterministic',
          engine_error: outcome.stage === 'layer1' ? 'layer1_unavailable' : 'assessment_unavailable',
          assessment_status: 'engine_unavailable',
        }
      } else if (outcome.status === 'tier1_pause') {
        // A binary gate cannot ask a clarifying question (ADR-009 §3): a structural
        // ambiguity maps to a CONSERVATIVE pause, never a "proceed".
        gateUsage = outcome.usage
        resultBody = {
          proceed: false,
          katorthoma_proximity: null,
          threshold: thresholdLevel,
          recommendation: 'pause_for_review',
          passions_detected: [],
          reasoning: `The action is structurally ambiguous (${outcome.trigger.trigger_code}); the gate pauses for review rather than evaluating an under-specified action.`,
          disclaimer: V3_DISCLAIMER,
          risk_class: resolvedRiskClass,
          evaluation_depth: 'deterministic',
          assessment_status: 'ambiguous_pause',
          clarification_needed: {
            trigger_code: outcome.trigger.trigger_code,
            question_text: outcome.trigger.question_text,
          },
          considered_alternatives_provided: consideredAlternativesProvided,
          alternatives_warning: alternativesWarning,
        }
      } else {
        // status === 'verdict' — the deterministic, signed result.
        gateUsage = outcome.usage
        const v = outcome.verdict
        const criticalOverride = !!alternativesWarning && resolvedRiskClass === 'critical'
        const rollbackPath = resolvedRiskClass === 'critical'
          ? (v.improvement_corrected || 'No rollback path provided — consider specifying one before proceeding.')
          : undefined
        resultBody = {
          proceed: criticalOverride ? false : v.proceed,
          katorthoma_proximity: v.katorthoma_proximity,
          threshold: thresholdLevel,
          recommendation: criticalOverride ? 'pause_for_review' : v.recommendation,
          passions_detected: v.passions_detected,
          is_kathekon: v.is_kathekon,
          kathekon_quality: v.kathekon_quality,
          reasoning: v.reasoning,
          improvement_hint: v.improvement_hint,
          disclaimer: V3_DISCLAIMER,
          risk_class: resolvedRiskClass,
          evaluation_depth: 'deterministic',
          rollback_path: rollbackPath,
          deliberation_quality: v.deliberation_quality,
          hasty_assent_risk: v.hasty_assent_risk,
          considered_alternatives_provided: consideredAlternativesProvided,
          alternatives_warning: alternativesWarning,
          stage_scores: v.stage_scores,
          // The Layer-1 extraction (R10-2) — parity with /api/reason; lets a
          // consumer re-run applyMechanisms over it and verify the full
          // action→extraction→assessment chain.
          extraction: outcome.extraction,
          // The verifiable verdict artifact: the signed wrapper when signing is
          // ON (production), else the bare deterministic assessment (R10-1 —
          // always emit SOME verifiable artifact, never a verdict with none).
          ...(outcome.signed
            ? { signed_assessment: outcome.signed }
            : { assessment: outcome.assessment }),
        }
      }

      // CI-10 metering + CI-8 cost: the ONE LLM call is the Sonnet L1 extraction.
      let measuredCostUsd: number | null = null
      let costBasis = 'no_llm_call'
      if (gateUsage) {
        if (loopAccumulator) {
          loopAccumulator.addCall(MODEL_DEEP, gateUsage.input_tokens, gateUsage.output_tokens)
        }
        measuredCostUsd = estimateCallCostCents(MODEL_DEEP, gateUsage.input_tokens, gateUsage.output_tokens) / 100
        costBasis = 'anthropic_usd_measured'
      }

      // Analytics (KG1: awaited, not fire-and-forget).
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'guardrail_check_v3',
          metadata: {
            agent_id: agent_id || null,
            proximity: (resultBody.katorthoma_proximity as string | null) ?? null,
            recommendation: resultBody.recommendation,
            proceed: resultBody.proceed,
            threshold: thresholdLevel,
            risk_class: resolvedRiskClass,
            evaluation_depth: 'deterministic',
            engine: 'translation-sandwich',
          },
        })
        .then(() => {})

      const sandwichEnvelope = buildEnvelope({
        result: resultBody,
        endpoint: '/api/guardrail',
        // Honest: the only LLM call is the Sonnet Layer-1 extraction. is_deterministic
        // stays the envelope default (false) — the endpoint makes an AI call; the
        // verifiability win is the signed Layer-2 verdict (engine_attribution +
        // signed_assessment), not an end-to-end determinism claim (ADR-009 §4).
        model: MODEL_DEEP,
        startTime,
        maxTokens: 4000,
        costUsd: measuredCostUsd,
        usage: keyCheck.valid ? {
          monthly_calls_after: keyCheck.monthly_calls_after,
          monthly_limit: keyCheck.monthly_calls_after + keyCheck.monthly_remaining,
          monthly_remaining: keyCheck.monthly_remaining,
        } : undefined,
        composability: {
          next_steps: resultBody.proceed ? ['execute_action'] : ['/api/guardrail'],
          recommended_action: resultBody.recommendation as string,
        },
        extra: { cost_basis: costBasis, engine_attribution: 'translation-sandwich' },
      })

      if (loopAccumulator && loopId) {
        return await finalizeLoopResponse({
          loopId,
          accumulator: loopAccumulator,
          apiKeyId: keyCheck.api_key_id,
          endpoint: 'guardrail',
          responseBody: sandwichEnvelope,
          responseStatus: 200,
          responseHeaders: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck),
          isBillable: gateUsage !== null,
        })
      }

      return NextResponse.json(sandwichEnvelope, {
        headers: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck),
      })
    }
    // ---- end #3b/#3c sandwich-port branch; verbatim legacy sage-guard path follows ----

    // Call the shared reasoning engine at risk-appropriate depth
    // Standard actions use quick depth for speed; Critical actions use deep depth for thorough evaluation
    const domainContext = resolvedRiskClass === 'critical'
      ? 'This is a CRITICAL safety gate evaluation. The action involves authentication, access control, data deletion, or deployment configuration. Apply maximum scrutiny. Evaluate whether alternatives were considered and whether a rollback path exists.'
      : resolvedRiskClass === 'elevated'
        ? 'This is an elevated safety gate evaluation. The action modifies existing user-facing functionality or adds external dependencies. Evaluate carefully.'
        : 'This is a binary safety gate evaluation. Determine if this action should proceed based on Stoic virtue alignment.'

    // Layer 3: project context at 'minimal' level (identity + ethical commitments only).
    // Guardrail is a safety gate — ethical commitments are relevant; phase/tensions are not.
    const projectContext = await getProjectContext('minimal')

    const reasoningResult = await runSageReason({
      input: action.trim(),
      context,
      depth: evaluationDepth,
      domain_context: domainContext,
      urgency_context: typeof urgency_context === 'string' ? urgency_context.trim() : undefined,
      stoicBrainContext: getStoicBrainContext(evaluationDepth),
      projectContext,
    })

    // CI-10: record this call's Anthropic cost in the loop accumulator from the
    // engine's exposed token usage. Absent usage (cache hit — no fresh LLM call)
    // ⇒ no cost added for this call, which is the honest figure.
    const gateUsage = reasoningResult.meta.usage
    if (loopAccumulator && gateUsage) {
      loopAccumulator.addCall(
        reasoningResult.meta.ai_model,
        gateUsage.input_tokens,
        gateUsage.output_tokens,
      )
    }
    // CI-8: the honest per-call cost for meta.cost_usd — measured from real
    // token usage when a fresh call happened; null (omitted) on a cache hit.
    // This unconditionally retires the stale competitor-anchored $0.0025.
    const measuredCostUsd = gateUsage
      ? estimateCallCostCents(reasoningResult.meta.ai_model, gateUsage.input_tokens, gateUsage.output_tokens) / 100
      : null
    const costBasis = gateUsage ? 'anthropic_usd_measured' : 'cache_hit_no_fresh_call'

    const assessmentData = reasoningResult.result as any
    const proximity: KatorthomaProximityLevel = assessmentData.katorthoma_proximity
    const recommendation = getV3Recommendation(proximity, thresholdLevel)
    const proceed = meetsThreshold(proximity, thresholdLevel)

    // Mechanisms applied depends on evaluation depth
    const mechanismsByDepth: Record<string, MechanismId[]> = {
      quick: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
      standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
      deep: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
    }

    // Generate reasoning receipt
    const receipt = extractReceipt({
      skillId: 'sage-guard',
      input: action.trim(),
      evalData: assessmentData,
      mechanisms: mechanismsByDepth[evaluationDepth] || mechanismsByDepth.quick,
    })

    // For Critical actions, extract or flag the rollback path
    const rollbackPath = resolvedRiskClass === 'critical'
      ? (assessmentData.rollback_path || assessmentData.improvement_path || 'No rollback path provided — consider specifying one before proceeding.')
      : undefined

    // Deliberation quality assessment (Item 8)
    // Evaluates whether the decision to act was adequately deliberated,
    // not just whether the action itself is virtuous.
    const hastyAssentRisk = reasoningResult.meta.hasty_assent_risk
    const stageScores = reasoningResult.meta.stage_scores
    let deliberationQuality: 'thorough' | 'adequate' | 'hasty' | 'impulsive' = 'adequate'
    if (hastyAssentRisk === 'high') {
      deliberationQuality = 'impulsive'
    } else if (hastyAssentRisk === 'moderate') {
      deliberationQuality = 'hasty'
    } else if (stageScores) {
      // If all stages are strong, deliberation is thorough
      const scores = Object.values(stageScores).filter(s => s !== 'not_applied')
      const strongCount = scores.filter(s => s === 'strong').length
      deliberationQuality = strongCount === scores.length ? 'thorough' : 'adequate'
    }

    // Considered alternatives check (Item 9)
    // For Critical + urgent actions, flag if no alternatives were evaluated.
    // This is the specific check that would have caught the auth middleware incident.
    let alternativesWarning: string | undefined
    if (resolvedRiskClass === 'critical' && urgency_context) {
      if (!considered_alternatives || (Array.isArray(considered_alternatives) && considered_alternatives.length === 0)) {
        alternativesWarning = 'HASTY ASSENT RISK: This is a Critical action taken under urgency with no alternatives considered. The auth middleware incident pattern applies. Consider what other approaches could achieve the same goal.'
      } else if (Array.isArray(considered_alternatives) && considered_alternatives.length === 1) {
        alternativesWarning = 'Only one alternative was considered for a Critical action under urgency. Consider whether additional options exist.'
      }
    }

    const result: V3GuardrailResponse & {
      reasoning_receipt?: typeof receipt
      risk_class?: string
      evaluation_depth?: string
      rollback_path?: string
      deliberation_quality?: string
      hasty_assent_risk?: string
      considered_alternatives_provided?: number
      alternatives_warning?: string
      stage_scores?: Record<string, string>
    } = {
      proceed: alternativesWarning && resolvedRiskClass === 'critical' ? false : proceed,
      katorthoma_proximity: proximity,
      threshold: thresholdLevel,
      recommendation: alternativesWarning && resolvedRiskClass === 'critical' ? 'pause_for_review' : recommendation,
      passions_detected: assessmentData.passion_diagnosis?.passions_detected || [],
      is_kathekon: assessmentData.is_kathekon,
      kathekon_quality: assessmentData.kathekon_assessment?.quality,
      reasoning: assessmentData.philosophical_reflection || 'Virtue evaluation complete.',
      improvement_hint: assessmentData.improvement_path || undefined,
      disclaimer: V3_DISCLAIMER,
      reasoning_receipt: receipt,
      risk_class: resolvedRiskClass,
      evaluation_depth: evaluationDepth,
      rollback_path: rollbackPath,
      deliberation_quality: deliberationQuality,
      hasty_assent_risk: hastyAssentRisk,
      considered_alternatives_provided: Array.isArray(considered_alternatives) ? considered_alternatives.length : undefined,
      alternatives_warning: alternativesWarning,
      stage_scores: stageScores,
    }

    // Analytics (fire and forget)
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'guardrail_check_v3',
        metadata: {
          agent_id: agent_id || null,
          proximity: proximity,
          recommendation,
          proceed,
          threshold: thresholdLevel,
          is_kathekon: result.is_kathekon,
          passions_count: result.passions_detected.length,
          risk_class: resolvedRiskClass,
          evaluation_depth: evaluationDepth,
        },
      })
      .then(() => {})

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/guardrail',
      // #3a model-reporting honesty (2026-06-19, R18). Previously hardcoded
      // 'claude-haiku-4-5-20251001' — a LIE for every elevated/critical gate,
      // which map risk_class→depth→model as elevated→standard→MODEL_DEEP and
      // critical→deep→MODEL_DEEP (Sonnet), not Haiku (riskDepthMap above +
      // DEPTH_CONFIG in sage-reason-engine.ts). The honest cost figure was
      // already computed from reasoningResult.meta.ai_model (the real model);
      // only the displayed model lied. reasoningResult.meta.ai_model is a
      // truthful string on every engine return path incl. cache-hit and the
      // quick→Sonnet parse-retry escalation. Side-effect-free: buildEnvelope
      // always receives the explicit costUsd override here, so `model` never
      // reaches the estimateCostUsd branch — it affects ONLY meta.ai_model.
      model: reasoningResult.meta.ai_model,
      startTime,
      maxTokens: 512,
      // CI-8: honest per-call cost (measured) or null on a cache hit, with a
      // basis note — never the retired competitor-anchored $0.0025.
      costUsd: measuredCostUsd,
      usage: keyCheck.valid ? {
        monthly_calls_after: keyCheck.monthly_calls_after,
        monthly_limit: keyCheck.monthly_calls_after + keyCheck.monthly_remaining,
        monthly_remaining: keyCheck.monthly_remaining,
      } : undefined,
      composability: {
        next_steps: result.proceed ? ['execute_action'] : ['/api/guardrail'],
        recommended_action: result.recommendation,
      },
      extra: { cost_basis: costBasis },
    })

    // CI-10: when metering is enabled, persist the loop_billing_events row and
    // emit X-Loop-* headers (the bill computed from the accumulator). KG1 rule 2:
    // finalizeLoopResponse awaits the RPC write. Flag UNSET ⇒ today's response
    // shape exactly (no DB write, no X-Loop headers).
    if (loopAccumulator && loopId) {
      return await finalizeLoopResponse({
        loopId,
        accumulator: loopAccumulator,
        apiKeyId: keyCheck.api_key_id,
        endpoint: 'guardrail',
        responseBody: envelope,
        responseStatus: 200,
        responseHeaders: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck),
        isBillable: true,
      })
    }

    return NextResponse.json(envelope, {
      headers: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck),
    })
  } catch (error) {
    console.error('Guardrail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET — Return usage documentation
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  return NextResponse.json(
    {
      name: 'SageReasoning Stoic Guardrail — V3',
      description:
        'V3 virtue-gate middleware for AI agents. Call before executing an action to check if it meets your ethical threshold using katorthoma proximity levels.',
      usage: {
        method: 'POST',
        url: 'https://www.sagereasoning.com/api/guardrail',
        body: {
          action: '(required) Description of the action the agent is about to take',
          context: '(optional) Additional context about the situation',
          threshold:
            '(optional, default deliberate) Minimum proximity level: reflexive | habitual | deliberate | principled | sage_like',
          agent_id: '(optional) Your agent identifier for tracking',
          risk_class: '(optional, default standard) Risk classification: standard | elevated | critical. Controls evaluation depth: standard→quick(3 mechanisms), elevated→standard(5), critical→deep(6). Critical actions also receive a rollback_path field.',
        },
        response: {
          proceed: 'boolean — true if proximity meets or exceeds threshold',
          katorthoma_proximity: 'reflexive | habitual | deliberate | principled | sage_like',
          recommendation:
            'proceed | proceed_with_caution | pause_for_review | do_not_proceed',
          is_kathekon: 'boolean — whether action is appropriate',
          kathekon_quality: 'strong | moderate | marginal | contrary',
          passions_detected: 'array of detected passions with root_passion, sub_species, false_judgement',
          reasoning: 'Brief virtue assessment',
          improvement_hint: 'How to make the action more virtuous (if below principled)',
          disclaimer: 'Standard disclaimer about the assessment',
          risk_class: 'The resolved risk classification (standard | elevated | critical)',
          evaluation_depth: 'The depth used for evaluation (quick | standard | deep)',
          rollback_path: '(Critical only) How to undo the action if it causes harm',
        },
      },
      example_integration: `
// Before executing any action:
const check = await fetch('https://www.sagereasoning.com/api/guardrail', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'Send automated marketing emails to all users',
    context: 'Users did not explicitly opt in to marketing',
    threshold: 'principled',
    agent_id: 'my-agent-v3'
  })
}).then(r => r.json());

if (!check.proceed) {
  console.log('Action blocked:', check.reasoning);
  console.log('Proximity level:', check.katorthoma_proximity);
  console.log('Try:', check.improvement_hint);
}
`.trim(),
    },
    {
      headers: {
        ...publicCorsHeaders(),
        'Cache-Control': 'public, max-age=3600',
      },
    }
  )
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return publicCorsPreflightResponse()
}
