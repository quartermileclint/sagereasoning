import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'

/**
 * GET /api/receipts — Query reasoning receipts
 *
 * Allows agents (and future Zeus) to browse reasoning history.
 * Supports filtering by agent_id, skill_id, proximity level, date range.
 *
 * Query params:
 *   ?agent_id=xyz          — Filter by agent
 *   ?skill_id=sage-guard   — Filter by skill
 *   ?proximity=deliberate  — Filter by minimum proximity level
 *   ?since=2026-04-01      — Receipts after this date (ISO 8601)
 *   ?until=2026-04-03      — Receipts before this date (ISO 8601)
 *   ?limit=20              — Max results (default 20, max 100)
 *   ?offset=0              — Pagination offset
 *   ?chain_id=uuid         — Filter by deliberation chain
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const url = new URL(request.url)
    const agentId = url.searchParams.get('agent_id')
    const skillId = url.searchParams.get('skill_id')
    const minProximity = url.searchParams.get('proximity')
    const since = url.searchParams.get('since')
    const until = url.searchParams.get('until')
    const chainId = url.searchParams.get('chain_id')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)

    // Build query
    let query = supabaseAdmin
      .from('reasoning_receipts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (agentId) query = query.eq('agent_id', agentId)
    if (skillId) query = query.eq('skill_id', skillId)
    if (chainId) query = query.eq('chain_id', chainId)
    if (since) query = query.gte('created_at', since)
    if (until) query = query.lte('created_at', until)

    // Proximity filter: return receipts AT or ABOVE the requested level
    if (minProximity) {
      const proximityOrder = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
      const minIndex = proximityOrder.indexOf(minProximity)
      if (minIndex >= 0) {
        const validLevels = proximityOrder.slice(minIndex)
        query = query.in('katorthoma_proximity', validLevels)
      }
    }

    const { data: receipts, count, error } = await query

    if (error) {
      console.error('Receipts query error:', error)
      return NextResponse.json({ error: 'Failed to query receipts' }, { status: 500 })
    }

    // Compute summary stats
    const proximityDistribution: Record<string, number> = {}
    const skillDistribution: Record<string, number> = {}
    for (const r of receipts || []) {
      proximityDistribution[r.katorthoma_proximity] = (proximityDistribution[r.katorthoma_proximity] || 0) + 1
      skillDistribution[r.skill_id] = (skillDistribution[r.skill_id] || 0) + 1
    }

    const result = {
      receipts: receipts || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
      summary: {
        proximity_distribution: proximityDistribution,
        skill_distribution: skillDistribution,
        total_passions: (receipts || []).reduce((sum, r) => sum + (r.passions_count || 0), 0),
      },
    }

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/receipts',
      model: 'none',
      startTime,
      maxTokens: 0,
      isDeterministic: true,
      composability: {
        next_steps: ['/api/patterns', '/api/receipts'],
        recommended_action: 'Feed receipt data to /api/patterns for trend detection, or refine query with filters.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Receipts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/receipts — Store a reasoning receipt
 *
 * Called internally by skill endpoints or externally by agents
 * wanting to persist their reasoning audit trail.
 *
 * Body:
 *   { receipt: ReasoningReceipt, agent_id?: string, chain_id?: string }
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { receipt, agent_id, chain_id } = await request.json()

    if (!receipt || typeof receipt !== 'object') {
      return NextResponse.json({ error: 'receipt object is required' }, { status: 400 })
    }

    // Validate minimum receipt fields
    if (!receipt.skill_id || !receipt.input_hash) {
      return NextResponse.json(
        { error: 'receipt must include skill_id and input_hash (use extractReceipt() to generate valid receipts)' },
        { status: 400 }
      )
    }

    // Store the receipt
    const { data, error } = await supabaseAdmin
      .from('reasoning_receipts')
      .insert({
        skill_id: receipt.skill_id,
        input_hash: receipt.input_hash,
        agent_id: agent_id || null,
        chain_id: chain_id || null,
        katorthoma_proximity: receipt.katorthoma_proximity || null,
        mechanisms_applied: receipt.mechanisms_applied || [],
        passions_count: (receipt.passions_detected || []).length,
        passions_detected: receipt.passions_detected || [],
        reasoning_trace: receipt.reasoning_trace || [],
        is_kathekon: receipt.is_kathekon ?? null,
        kathekon_quality: receipt.kathekon_quality || null,
        recommended_next: receipt.recommended_next || null,
        full_receipt: receipt,
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('Receipt insert error:', error)
      return NextResponse.json({ error: 'Failed to store receipt' }, { status: 500 })
    }

    const result = {
      receipt_id: data.id,
      stored_at: data.created_at,
      skill_id: receipt.skill_id,
      katorthoma_proximity: receipt.katorthoma_proximity,
    }

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/receipts',
      model: 'none',
      startTime,
      maxTokens: 0,
      isDeterministic: true,
      composability: {
        next_steps: ['/api/receipts', '/api/patterns'],
        recommended_action: 'Receipt stored. Query /api/receipts to browse history or /api/patterns for trend analysis.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Receipt store API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
