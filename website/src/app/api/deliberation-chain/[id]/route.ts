import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import type { ChainSummary, StepSummary } from '@/lib/deliberation'

/**
 * GET /api/deliberation-chain/:id
 *
 * Retrieve a deliberation chain with summary view.
 * Returns: chain metadata + score trajectory + first/latest step summaries.
 * Optional ?full=true to get all steps (the full chain for deep reflection).
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
    // Fetch the chain
    const { data: chain, error: chainErr } = await supabaseAdmin
      .from('deliberation_chains')
      .select('*')
      .eq('id', chainId)
      .single()

    if (chainErr || !chain) {
      return NextResponse.json({ error: 'Deliberation chain not found' }, { status: 404 })
    }

    // Fetch all steps
    const { data: steps, error: stepsErr } = await supabaseAdmin
      .from('deliberation_steps')
      .select('*')
      .eq('chain_id', chainId)
      .order('step_number', { ascending: true })

    if (stepsErr || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'No steps found for this chain' }, { status: 500 })
    }

    const firstStep = steps[0]
    const latestStep = steps[steps.length - 1]

    const toStepSummary = (s: typeof firstStep): StepSummary => ({
      step_number: s.step_number,
      action_description: s.action_description,
      wisdom_score: s.wisdom_score,
      justice_score: s.justice_score,
      courage_score: s.courage_score,
      temperance_score: s.temperance_score,
      total_score: s.total_score,
      sage_alignment: s.sage_alignment,
      reasoning: s.reasoning,
      growth_action: s.growth_action,
    })

    const summary: ChainSummary = {
      chain_id: chain.id,
      status: chain.status,
      original_action: chain.original_action,
      initial_score: chain.initial_score,
      current_score: chain.current_score,
      best_score: chain.best_score,
      total_iterations: chain.iteration_count,
      score_trajectory: steps.map((s: typeof firstStep) => Number(s.total_score)),
      net_improvement: Number((latestStep.total_score - firstStep.total_score).toFixed(2)),
      sage_growth_action: chain.sage_growth_action,
      created_at: chain.created_at,
      updated_at: chain.updated_at,
      first_step: toStepSummary(firstStep),
      latest_step: toStepSummary(latestStep),
    }

    const response: Record<string, unknown> = { summary }

    // If full view requested, include all steps
    if (showFull) {
      response.steps = steps.map((s: typeof firstStep) => ({
        step_number: s.step_number,
        action_description: s.action_description,
        revision_rationale: s.revision_rationale,
        wisdom_score: s.wisdom_score,
        justice_score: s.justice_score,
        courage_score: s.courage_score,
        temperance_score: s.temperance_score,
        total_score: s.total_score,
        sage_alignment: s.sage_alignment,
        reasoning: s.reasoning,
        improvement_path: s.improvement_path,
        strength: s.strength,
        growth_area: s.growth_area,
        growth_action: s.growth_action,
        growth_action_projected_score: s.growth_action_projected_score,
        score_delta: s.score_delta,
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
