import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scoreCore, applyQ5, finalizeWithoutQ5, RETAKE_INTERVAL_DAYS } from '@/lib/baseline-assessment'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const user_id = auth.user.id

  try {
    const body = await request.json()
    const { answers, q5_answer } = body

    if (!answers || !Array.isArray(answers) || answers.length !== 4) {
      return NextResponse.json({ error: 'Exactly 4 answer IDs required' }, { status: 400 })
    }

    // Check retake eligibility
    const { data: existing } = await supabaseAdmin
      .from('baseline_assessments')
      .select('created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) {
      const lastDate = new Date(existing.created_at)
      const eligibleDate = new Date(lastDate)
      eligibleDate.setDate(eligibleDate.getDate() + RETAKE_INTERVAL_DAYS)
      if (new Date() < eligibleDate) {
        return NextResponse.json({
          error: 'Retake not yet eligible',
          eligible_date: eligibleDate.toISOString(),
        }, { status: 429 })
      }
    }

    // Score core questions
    const coreResult = scoreCore(answers)

    // If Q5 is needed and provided, apply it
    let finalResult
    if (coreResult.needs_q5 && q5_answer) {
      finalResult = applyQ5(coreResult, q5_answer)
    } else if (coreResult.needs_q5 && !q5_answer) {
      // Return intermediate result — client needs to show Q5
      return NextResponse.json({
        needs_q5: coreResult.needs_q5,
        intermediate_score: coreResult.total_score,
      })
    } else {
      finalResult = finalizeWithoutQ5(coreResult)
    }

    // Save to database
    const { error: insertError } = await supabaseAdmin
      .from('baseline_assessments')
      .insert({
        user_id,
        total_score: finalResult.total_score,
        wisdom_score: finalResult.wisdom_score,
        justice_score: finalResult.justice_score,
        courage_score: finalResult.courage_score,
        temperance_score: finalResult.temperance_score,
        alignment_tier: finalResult.alignment_tier,
        strongest_virtue: finalResult.strongest_virtue,
        growth_area: finalResult.growth_area,
        interpretation: finalResult.interpretation,
        answers: finalResult.answers,
        q5_answer: finalResult.q5_answer || null,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 })
    }

    // Log analytics event
    await supabaseAdmin.from('analytics_events').insert({
      event_type: 'baseline_assessment',
      user_id,
      metadata: {
        total_score: finalResult.total_score,
        alignment_tier: finalResult.alignment_tier,
        is_retake: !!existing,
      },
    }).then(() => {})

    return NextResponse.json(finalResult)
  } catch (error: unknown) {
    console.error('Baseline assessment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — check if user has a baseline and when retake is eligible
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { data } = await supabaseAdmin
    .from('baseline_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) {
    return NextResponse.json({ has_baseline: false })
  }

  const eligibleDate = new Date(data.created_at)
  eligibleDate.setDate(eligibleDate.getDate() + RETAKE_INTERVAL_DAYS)

  return NextResponse.json({
    has_baseline: true,
    baseline: data,
    retake_eligible: new Date() >= eligibleDate,
    retake_eligible_date: eligibleDate.toISOString(),
  })
}
