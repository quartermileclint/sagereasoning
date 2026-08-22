import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'

/**
 * GET /api/action-evaluations
 *
 * Returns the authenticated user's own action_evaluations_v3 rows (the same
 * columns and ordering the dashboard's past-evaluations panel has always
 * rendered), server-side, via the service-role client.
 *
 * Route-change-first for the RLS-vs-route-enforcement survey's Class B row
 * 19 (`operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md`):
 * `src/app/dashboard/page.tsx` previously queried `action_evaluations_v3`
 * directly from the browser via the anon-key client, relying on the table's
 * owner SELECT policy for scoping. That is a legitimate dependency — this
 * route removes it by moving the identical query server-side, with `userId`
 * server-verified via `requireAuth` rather than trusted from RLS. Once no
 * consumer depends on the owner policies, they can be dropped in a future
 * RLS-lockdown migration (not this session's job — this is the route-change
 * half only).
 *
 * Bearer-JWT only — callers must use `authFetch`, never a bare `fetch`.
 */
export async function GET(request: NextRequest) {
  // A read, not a scoring call — the same reasoning /api/milestones and
  // /api/mentor/practice-status already applied (PR19, 2026-07-27/29): this
  // route fires on every dashboard mount, so it shares the `analytics`
  // bucket rather than /api/reason's measured `scoring` bucket.
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.analytics)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  const limitParam = parseInt(searchParams.get('limit') || '20', 10)
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20

  const { data, error } = await supabaseAdmin
    .from('action_evaluations_v3')
    // Column list identical to the dashboard's previous direct query — the
    // full report shape (2026-08-02), not the trimmed summary-only list.
    .select(
      'id, action, context, relationships, emotional_state, within_prohairesis, outside_prohairesis, is_kathekon, kathekon_quality, katorthoma_proximity, passions_detected, false_judgements, causal_stage_affected, virtue_domains_engaged, ruling_faculty_state, improvement_path, oikeiosis_context, philosophical_reflection, created_at'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('action-evaluations GET error:', error)
    return NextResponse.json({ error: 'Failed to load evaluations' }, { status: 500 })
  }

  return NextResponse.json({ evaluations: data || [] })
}
