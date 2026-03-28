import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'

/**
 * POST /api/deliberation-chain/:id/conclude
 *
 * Mark a deliberation chain as concluded (agent has decided on a final action).
 * Optionally mark as 'abandoned' if the agent decided not to act.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const { id: chainId } = await params

  try {
    const body = await request.json().catch(() => ({}))
    const status = body.abandon === true ? 'abandoned' : 'concluded'

    // Verify chain exists and is active
    const { data: chain, error: chainErr } = await supabaseAdmin
      .from('deliberation_chains')
      .select('id, status, initial_score, current_score, best_score, iteration_count')
      .eq('id', chainId)
      .single()

    if (chainErr || !chain) {
      return NextResponse.json({ error: 'Deliberation chain not found' }, { status: 404 })
    }

    if (chain.status !== 'active') {
      return NextResponse.json({
        error: `Chain is already ${chain.status}`,
        chain_id: chainId,
      }, { status: 400 })
    }

    // Update status
    const { error: updateErr } = await supabaseAdmin
      .from('deliberation_chains')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', chainId)

    if (updateErr) {
      console.error('Failed to conclude chain:', updateErr)
      return NextResponse.json({ error: 'Failed to update chain status' }, { status: 500 })
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: `deliberation_chain_${status}`,
        metadata: {
          chain_id: chainId,
          initial_score: chain.initial_score,
          final_score: chain.current_score,
          best_score: chain.best_score,
          iterations: chain.iteration_count,
          net_improvement: Number((chain.current_score - chain.initial_score).toFixed(2)),
        },
      })
      .then(() => {})

    return NextResponse.json({
      chain_id: chainId,
      status,
      initial_score: chain.initial_score,
      final_score: chain.current_score,
      best_score: chain.best_score,
      total_iterations: chain.iteration_count,
      net_improvement: Number((chain.current_score - chain.initial_score).toFixed(2)),
      message: status === 'concluded'
        ? 'Deliberation concluded. The sage commends your engagement with virtue. Act well.'
        : 'Deliberation abandoned. The sage notes that choosing not to act can itself be a form of wisdom — provided the decision was deliberate, not driven by avoidance.',
      reflection_url: `https://www.sagereasoning.com/api/deliberation-chain/${chainId}?full=true`,
    }, { headers: publicCorsHeaders() })
  } catch (error) {
    console.error('Conclude chain error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return publicCorsPreflightResponse()
}
