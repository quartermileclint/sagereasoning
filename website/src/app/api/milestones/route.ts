import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkNewMilestones, type MilestoneCheckData } from '@/lib/milestones'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'

/**
 * GET /api/milestones?user_id=...
 * Returns the user's earned milestones.
 *
 * POST /api/milestones?user_id=...
 * Checks for newly earned milestones and awards them.
 * Called after scoring an action or completing a reflection.
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

  // Gather all data needed for milestone checks in parallel
  const [
    earnedRes,
    actionsRes,
    reflectionsRes,
    baselineRes,
    profileRes,
  ] = await Promise.all([
    supabaseAdmin.from('milestones').select('milestone_id').eq('user_id', userId),
    supabaseAdmin.from('action_scores')
      .select('wisdom_score, justice_score, courage_score, temperance_score, total_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('reflections')
      .select('id')
      .eq('user_id', userId),
    supabaseAdmin.from('baseline_assessments')
      .select('id')
      .eq('user_id', userId)
      .limit(1),
    supabaseAdmin.from('user_stoic_profiles')
      .select('avg_total')
      .eq('user_id', userId)
      .single(),
  ])

  const earnedMilestoneIds = (earnedRes.data || []).map(m => m.milestone_id)
  const actionScores = actionsRes.data || []
  const reflectionCount = (reflectionsRes.data || []).length
  const hasBaseline = (baselineRes.data || []).length > 0
  const avgTotal = profileRes.data?.avg_total || 0

  // Calculate days since last action (for returning practitioner milestone)
  let daysSinceLastAction: number | null = null
  if (actionScores.length >= 2) {
    const latestDate = new Date(actionScores[0].created_at)
    const previousDate = new Date(actionScores[1].created_at)
    daysSinceLastAction = Math.floor((latestDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const checkData: MilestoneCheckData = {
    earnedMilestoneIds,
    actionScores,
    reflectionCount,
    hasBaseline,
    avgTotal,
    daysSinceLastAction,
  }

  const newMilestoneIds = checkNewMilestones(checkData)

  if (newMilestoneIds.length === 0) {
    return NextResponse.json({ new_milestones: [], all_milestones: earnedMilestoneIds })
  }

  // Get current scores for snapshot
  const latestAction = actionScores[0]

  // Insert new milestones
  const inserts = newMilestoneIds.map(milestoneId => ({
    user_id: userId,
    milestone_id: milestoneId,
    wisdom_score: latestAction?.wisdom_score || 0,
    justice_score: latestAction?.justice_score || 0,
    courage_score: latestAction?.courage_score || 0,
    temperance_score: latestAction?.temperance_score || 0,
    total_score: latestAction?.total_score || 0,
  }))

  const { error: insertError } = await supabaseAdmin
    .from('milestones')
    .upsert(inserts, { onConflict: 'user_id,milestone_id' })

  if (insertError) {
    // Log but don't fail — milestones table may not exist yet
    console.error('Failed to insert milestones:', insertError)
    return NextResponse.json({ new_milestones: [], all_milestones: earnedMilestoneIds })
  }

  return NextResponse.json({
    new_milestones: newMilestoneIds,
    all_milestones: [...earnedMilestoneIds, ...newMilestoneIds],
  })
}
