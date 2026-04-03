import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkNewMilestones, type V3MilestoneCheckData } from '@/lib/milestones'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'

/**
 * GET /api/milestones
 * Returns the user's earned milestones.
 *
 * POST /api/milestones
 * Checks for newly earned milestones and awards them.
 * Called after evaluating an action or completing a reflection.
 */

export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const userId = auth.user.id

  const { data: milestones, error } = await supabaseAdmin
    .from('milestones')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: true })

  if (error) {
    // Table might not exist yet — return empty array gracefully
    return NextResponse.json({ milestones: [] })
  }

  return NextResponse.json({ milestones: milestones || [] })
}

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const userId = auth.user.id

  // Gather all data needed for V3 milestone checks in parallel
  const [
    earnedRes,
    evalsRes,
    reflectionsRes,
    baselineV3Res,
  ] = await Promise.all([
    supabaseAdmin.from('milestones').select('milestone_id').eq('user_id', userId),
    // V3 evaluations
    supabaseAdmin.from('action_evaluations_v3')
      .select('katorthoma_proximity, passions_detected, oikeiosis_context, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('reflections')
      .select('id')
      .eq('user_id', userId),
    // V3 baseline
    supabaseAdmin.from('baseline_assessments_v3')
      .select('senecan_grade')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const earnedMilestoneIds = (earnedRes.data || []).map(m => m.milestone_id)
  const evaluations = evalsRes.data || []
  const reflectionCount = (reflectionsRes.data || []).length
  const hasBaseline = !!baselineV3Res.data
  const senecanGrade = baselineV3Res.data?.senecan_grade

  // Calculate days since last action
  let daysSinceLastAction: number | null = null
  if (evaluations.length >= 2) {
    const latestDate = new Date(evaluations[0].created_at)
    const previousDate = new Date(evaluations[1].created_at)
    daysSinceLastAction = Math.floor(
      (latestDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  const checkData: V3MilestoneCheckData = {
    earnedMilestoneIds,
    hasBaseline,
    senecanGrade,
    evaluations,
    reflectionCount,
    daysSinceLastAction,
  }

  const newMilestoneIds = checkNewMilestones(checkData)

  if (newMilestoneIds.length === 0) {
    return NextResponse.json({ new_milestones: [], all_milestones: earnedMilestoneIds })
  }

  // Insert new milestones (V3: no V1 score snapshot needed)
  const inserts = newMilestoneIds.map(milestoneId => ({
    user_id: userId,
    milestone_id: milestoneId,
  }))

  const { error: insertError } = await supabaseAdmin
    .from('milestones')
    .upsert(inserts, { onConflict: 'user_id,milestone_id' })

  if (insertError) {
    console.error('Failed to insert milestones:', insertError)
    return NextResponse.json({ new_milestones: [], all_milestones: earnedMilestoneIds })
  }

  return NextResponse.json({
    new_milestones: newMilestoneIds,
    all_milestones: [...earnedMilestoneIds, ...newMilestoneIds],
  })
}
