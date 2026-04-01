import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import type {
  V3ChainSummary,
  V3StepSummary,
  V3DeliberationStep,
  V3DeliberationChain,
} from '@/lib/deliberation'
import { calculateDirectionOfTravel, calculatePassionsArc } from '@/lib/deliberation'

/**
 * GET /api/deliberation-chain/:id
 *
 * Retrieve a V3 deliberation chain with summary view.
 * Returns: chain metadata + proximity trajectory + first/latest step summaries.
 * Optional ?full=true to get all steps (the full chain for deep reflection).
 *
 * V3 Changes (R6a–d):
 * - Reads from deliberation_chains_v3 and deliberation_steps_v3 tables
 * - Returns proximity levels (not numeric scores)
 * - Includes passions_arc summary
 * - Calculates direction_of_travel from proximity trajectory
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const { id: chainId } = await params
  const showFull = request.nextUrl.searchParams.get('full') === 'true'

  try {
    // Fetch the V3 chain
    const { data: chain, error: chainErr } = await supabaseAdmin
      .from('deliberation_chains_v3')
      .select('*')
      .eq('id', chainId)
      .single()

    if (chainErr || !chain) {
      return NextResponse.json({ error: 'Deliberation chain not found' }, { status: 404 })
    }

    // Fetch all V3 steps
    const { data: steps, error: stepsErr } = await supabaseAdmin
      .from('deliberation_steps_v3')
      .select('*')
      .eq('chain_id', chainId)
      .order('step_number', { ascending: true })

    if (stepsErr || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'No steps found for this chain' }, { status: 500 })
    }

    const firstStep = steps[0] as V3DeliberationStep
    const latestStep = steps[steps.length - 1] as V3DeliberationStep

    // Build proximity trajectory for direction_of_travel calculation
    const proximityTrajectory = steps.map((s: V3DeliberationStep) => s.katorthoma_proximity)
    const directionOfTravel = calculateDirectionOfTravel(proximityTrajectory)
    const passionsArc = calculatePassionsArc(steps)

    // Convert step to V3StepSummary
    const toV3StepSummary = (s: V3DeliberationStep): V3StepSummary => ({
      step_number: s.step_number,
      action_description: s.action_description,
      katorthoma_proximity: s.katorthoma_proximity,
      kathekon_quality: s.kathekon_quality,
      passions_detected: s.passions_detected,
      false_judgements: s.false_judgements,
      philosophical_reflection: s.philosophical_reflection,
      improvement_path: s.improvement_path,
    })

    const summary: V3ChainSummary = {
      chain_id: chain.id,
      status: chain.status,
      original_action: chain.original_action,
      initial_proximity: chain.initial_proximity,
      current_proximity: chain.current_proximity,
      best_proximity: chain.best_proximity,
      total_iterations: chain.iteration_count,
      proximity_trajectory: proximityTrajectory,
      direction_of_travel: directionOfTravel,
      passions_arc: passionsArc,
      created_at: chain.created_at,
      updated_at: chain.updated_at,
      first_step: toV3StepSummary(firstStep),
      latest_step: toV3StepSummary(latestStep),
    }

    const response: Record<string, unknown> = { summary }

    // If full view requested, include all V3 steps
    if (showFull) {
      response.steps = steps.map((s: V3DeliberationStep) => ({
        id: s.id,
        chain_id: s.chain_id,
        step_number: s.step_number,
        action_description: s.action_description,
        revision_rationale: s.revision_rationale,
        katorthoma_proximity: s.katorthoma_proximity,
        kathekon_quality: s.kathekon_quality,
        is_kathekon: s.is_kathekon,
        passions_detected: s.passions_detected,
        false_judgements: s.false_judgements,
        causal_stage_affected: s.causal_stage_affected,
        virtue_domains_engaged: s.virtue_domains_engaged,
        ruling_faculty_state: s.ruling_faculty_state,
        philosophical_reflection: s.philosophical_reflection,
        improvement_path: s.improvement_path,
        oikeiosis_context: s.oikeiosis_context,
        proximity_direction: s.proximity_direction,
        passions_direction: s.passions_direction,
        cicero_assessment: s.cicero_assessment,
        iteration_warning_issued: s.iteration_warning_issued,
        created_at: s.created_at,
      }))
    }

    return NextResponse.json(response, { headers: publicCorsHeaders() })
  } catch (error) {
    console.error('Deliberation chain retrieval error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return publicCorsPreflightResponse()
}
