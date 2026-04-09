import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST } from '@/lib/model-config'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'

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

    // Load practitioner context once (Layer 2 — personalised reasoning)
    const practitionerContext = await getPractitionerContext(auth.user.id)

    // Load project context (Layer 3 — project context)
    const projectContext = await getProjectContext('condensed')

    // Evaluate each option via sage-reason
    const scoreData: OptionScore[] = []
    for (let i = 0; i < options.length; i++) {
      const option = options[i].trim()
      const reasoningResult = await runSageReason({
        input: option,
        context,
        depth: 'standard',
        domain_context: domainContext,
        stoicBrainContext: getStoicBrainContext('standard'),
        practitionerContext,
        projectContext,
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
