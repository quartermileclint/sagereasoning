import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'

/**
 * POST /api/patterns — Detect reasoning patterns from stored receipts
 *
 * Analyzes an agent's reasoning history to surface:
 * - Recurring passions (same root_passion appearing across receipts)
 * - Proximity trends (improving, stable, or regressing over time)
 * - Skill preferences (which skills the agent uses most)
 * - Virtue gaps (virtues consistently underengaged)
 * - Passion clusters (combinations of passions that co-occur)
 *
 * Body:
 *   { agent_id?: string, since?: string, limit?: number }
 *
 * This is deterministic analysis — no LLM call, just receipt aggregation.
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { agent_id, since, limit: receiptLimit } = await request.json()

    const maxReceipts = Math.min(receiptLimit || 100, 500)

    // Fetch receipts for analysis
    let query = supabaseAdmin
      .from('reasoning_receipts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(maxReceipts)

    if (agent_id) query = query.eq('agent_id', agent_id)
    if (since) query = query.gte('created_at', since)

    const { data: receipts, error } = await query

    if (error) {
      console.error('Pattern query error:', error)
      return NextResponse.json({ error: 'Failed to query receipts' }, { status: 500 })
    }

    if (!receipts || receipts.length === 0) {
      return NextResponse.json(
        buildEnvelope({
          result: {
            patterns: [],
            receipts_analyzed: 0,
            message: 'No receipts found for analysis. Use sage skills to generate reasoning receipts first.',
          },
          endpoint: '/api/patterns',
          model: 'none',
          startTime,
          maxTokens: 0,
          isDeterministic: true,
        }),
        { headers: corsHeaders() }
      )
    }

    const patterns: PatternResult[] = []

    // ── Pattern 1: Recurring passions ──────────────────────────────
    const passionCounts: Record<string, { count: number; sub_species: Set<string>; false_judgements: Set<string> }> = {}
    for (const r of receipts) {
      for (const p of (r.passions_detected || []) as any[]) {
        const root = p.root_passion || 'unknown'
        if (!passionCounts[root]) {
          passionCounts[root] = { count: 0, sub_species: new Set(), false_judgements: new Set() }
        }
        passionCounts[root].count++
        if (p.sub_species) passionCounts[root].sub_species.add(p.sub_species)
        if (p.false_judgement) passionCounts[root].false_judgements.add(p.false_judgement)
      }
    }

    for (const [root, data] of Object.entries(passionCounts)) {
      if (data.count >= 2) {
        patterns.push({
          pattern_type: 'recurring_passion',
          confidence: Math.min(data.count / receipts.length, 1.0),
          description: `${root} passion detected ${data.count} times across ${receipts.length} receipts`,
          data: {
            root_passion: root,
            occurrences: data.count,
            sub_species: Array.from(data.sub_species),
            common_false_judgements: Array.from(data.false_judgements).slice(0, 5),
          },
        })
      }
    }

    // ── Pattern 2: Proximity trend ─────────────────────────────────
    const proximityOrder = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
    const proximityValues = receipts
      .filter(r => r.katorthoma_proximity)
      .map(r => proximityOrder.indexOf(r.katorthoma_proximity))
      .filter(v => v >= 0)

    if (proximityValues.length >= 3) {
      // Simple linear trend: compare first half average to second half average
      const mid = Math.floor(proximityValues.length / 2)
      const olderHalf = proximityValues.slice(mid) // older (later indices because sorted DESC)
      const newerHalf = proximityValues.slice(0, mid)
      const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length
      const newerAvg = newerHalf.reduce((a, b) => a + b, 0) / newerHalf.length
      const diff = newerAvg - olderAvg

      let trend: 'improving' | 'stable' | 'regressing'
      if (diff > 0.3) trend = 'improving'
      else if (diff < -0.3) trend = 'regressing'
      else trend = 'stable'

      patterns.push({
        pattern_type: 'proximity_trend',
        confidence: Math.min(Math.abs(diff) / 2, 1.0),
        description: `Proximity trend is ${trend} (avg shift: ${diff > 0 ? '+' : ''}${diff.toFixed(2)} levels)`,
        data: {
          trend,
          older_average: proximityOrder[Math.round(olderAvg)] || 'unknown',
          newer_average: proximityOrder[Math.round(newerAvg)] || 'unknown',
          shift: diff.toFixed(2),
          samples: proximityValues.length,
        },
      })
    }

    // ── Pattern 3: Skill preferences ───────────────────────────────
    const skillCounts: Record<string, number> = {}
    for (const r of receipts) {
      skillCounts[r.skill_id] = (skillCounts[r.skill_id] || 0) + 1
    }
    const sortedSkills = Object.entries(skillCounts).sort(([, a], [, b]) => b - a)

    if (sortedSkills.length > 0) {
      patterns.push({
        pattern_type: 'skill_preference',
        confidence: sortedSkills[0][1] / receipts.length,
        description: `Most used skill: ${sortedSkills[0][0]} (${sortedSkills[0][1]}/${receipts.length} receipts)`,
        data: {
          skills_ranked: sortedSkills.map(([skill, count]) => ({ skill, count, percentage: Math.round((count / receipts.length) * 100) })),
        },
      })
    }

    // ── Pattern 4: Virtue gaps ─────────────────────────────────────
    // Check which mechanisms are underrepresented
    const mechanismCounts: Record<string, number> = {}
    for (const r of receipts) {
      for (const m of (r.mechanisms_applied || []) as string[]) {
        mechanismCounts[m] = (mechanismCounts[m] || 0) + 1
      }
    }

    const allMechanisms = ['control_filter', 'kathekon_assessment', 'passion_diagnosis', 'oikeiosis', 'virtue_assessment']
    const avgUsage = receipts.length > 0 ? Object.values(mechanismCounts).reduce((a, b) => a + b, 0) / allMechanisms.length : 0
    const underused = allMechanisms.filter(m => (mechanismCounts[m] || 0) < avgUsage * 0.5)

    if (underused.length > 0) {
      patterns.push({
        pattern_type: 'virtue_gap',
        confidence: 0.6,
        description: `Underengaged mechanisms: ${underused.join(', ')}`,
        data: {
          underused_mechanisms: underused,
          mechanism_usage: Object.fromEntries(allMechanisms.map(m => [m, mechanismCounts[m] || 0])),
          recommendation: `Consider using skills that exercise ${underused.join(' and ')} to build a more balanced reasoning practice.`,
        },
      })
    }

    // ── Pattern 5: Passion clusters ────────────────────────────────
    // Find passions that co-occur in the same receipt
    const pairCounts: Record<string, number> = {}
    for (const r of receipts) {
      const passions = ((r.passions_detected || []) as any[]).map(p => p.root_passion).filter(Boolean)
      const unique = [...new Set(passions)]
      for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
          const key = [unique[i], unique[j]].sort().join('+')
          pairCounts[key] = (pairCounts[key] || 0) + 1
        }
      }
    }

    for (const [pair, count] of Object.entries(pairCounts)) {
      if (count >= 2) {
        patterns.push({
          pattern_type: 'passion_cluster',
          confidence: Math.min(count / receipts.length, 1.0),
          description: `Passions ${pair.replace('+', ' and ')} co-occur in ${count} receipts`,
          data: {
            passions: pair.split('+'),
            co_occurrences: count,
            interpretation: `When ${pair.split('+')[0]} arises, ${pair.split('+')[1]} tends to accompany it. Address the shared false judgement underlying both.`,
          },
        })
      }
    }

    // Sort patterns by confidence descending
    patterns.sort((a, b) => b.confidence - a.confidence)

    // Persist detected patterns
    if (patterns.length > 0) {
      const dateRange = receipts.length > 0 ? {
        start: receipts[receipts.length - 1].created_at,
        end: receipts[0].created_at,
      } : null

      await supabaseAdmin
        .from('reasoning_patterns')
        .insert(patterns.map(p => ({
          agent_id: agent_id || null,
          pattern_type: p.pattern_type,
          pattern_data: p.data,
          confidence: p.confidence,
          receipts_analyzed: receipts.length,
          date_range_start: dateRange?.start || null,
          date_range_end: dateRange?.end || null,
        })))
        .then(() => {})
    }

    const result = {
      patterns,
      receipts_analyzed: receipts.length,
      date_range: receipts.length > 0 ? {
        oldest: receipts[receipts.length - 1].created_at,
        newest: receipts[0].created_at,
      } : null,
      disclaimer: 'Patterns are derived from reasoning receipt history and reflect tendencies, not fixed character traits. Stoic practice is about sustained effort toward virtue.',
    }

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/patterns',
      model: 'none',
      startTime,
      maxTokens: 0,
      isDeterministic: true,
      composability: {
        next_steps: ['/api/reason', '/api/reflect'],
        recommended_action: patterns.length > 0
          ? `${patterns.length} patterns detected. Use /api/reflect to work on recurring passions, or /api/reason for targeted reasoning practice.`
          : 'No strong patterns detected yet. Continue using sage skills to build reasoning history.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Patterns API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/patterns — Retrieve previously detected patterns
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
    const patternType = url.searchParams.get('type')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)

    let query = supabaseAdmin
      .from('reasoning_patterns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (agentId) query = query.eq('agent_id', agentId)
    if (patternType) query = query.eq('pattern_type', patternType)

    const { data: patterns, error } = await query

    if (error) {
      console.error('Pattern retrieval error:', error)
      return NextResponse.json({ error: 'Failed to retrieve patterns' }, { status: 500 })
    }

    const envelope = buildEnvelope({
      result: { patterns: patterns || [] },
      endpoint: '/api/patterns',
      model: 'none',
      startTime,
      maxTokens: 0,
      isDeterministic: true,
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Patterns GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}

// ── Types ──────────────────────────────────────────────────────
interface PatternResult {
  pattern_type: 'recurring_passion' | 'proximity_trend' | 'skill_preference' | 'virtue_gap' | 'improvement_trajectory' | 'passion_cluster'
  confidence: number
  description: string
  data: Record<string, unknown>
}
