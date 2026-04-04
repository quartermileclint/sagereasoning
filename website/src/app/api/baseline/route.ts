import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scoreCore, applyQ6, finalizeWithoutQ6, RETAKE_INTERVAL_DAYS } from '@/lib/baseline-assessment'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'

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
    const startTime = Date.now()
    const body = await request.json()
    const { answers, q6_answer } = body

    // V3: 5 core questions (Q1-Q5)
    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return NextResponse.json({ error: 'Exactly 5 answer IDs required' }, { status: 400 })
    }

    // Check retake eligibility
    const { data: existing } = await supabaseAdmin
      .from('baseline_assessments_v3')
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

    // Score core questions (Q1-Q5)
    const coreResult = scoreCore(answers)

    // If Q6 is needed and provided, apply it
    let finalResult
    if (coreResult.needs_q6 && q6_answer) {
      finalResult = applyQ6(coreResult, q6_answer)
    } else if (coreResult.needs_q6 && !q6_answer) {
      // Return intermediate result - client needs to show Q6
      return NextResponse.json({
        needs_q6: coreResult.needs_q6,
      })
    } else {
      finalResult = finalizeWithoutQ6(coreResult)
    }

    // Save to V3 database table
    const { error: insertError } = await supabaseAdmin
      .from('baseline_assessments_v3')
      .insert({
        user_id,
        passion_reduction: finalResult.passion_reduction,
        judgement_quality: finalResult.judgement_quality,
        disposition_stability: finalResult.disposition_stability,
        oikeiosis_stage: finalResult.oikeiosis_stage,
        senecan_grade: finalResult.senecan_grade,
        dominant_passion: finalResult.dominant_passion,
        interpretation: finalResult.interpretation,
        disclaimer: finalResult.disclaimer,
        answers: finalResult.answers,
        q6_answer: finalResult.q6_answer || null,
      })

    if (insertError) {
      // Log error code only — never log full payloads containing user data
      console.error('Baseline insert error:', insertError.code || 'unknown')
      // Return generic error — never expose database internals to clients
      return NextResponse.json({
        error: 'Failed to save assessment. Please try again.',
      }, { status: 500 })
    }

    // Log analytics event
    await supabaseAdmin.from('analytics_events').insert({
      event_type: 'baseline_assessment',
      user_id,
      metadata: {
        senecan_grade: finalResult.senecan_grade,
        dominant_passion: finalResult.dominant_passion,
        oikeiosis_stage: finalResult.oikeiosis_stage,
        is_retake: !!existing,
      },
    }).then(() => {})

    const envelope = buildEnvelope({
      result: finalResult,
      endpoint: '/api/baseline',
      model: 'claude-sonnet-4-6',
      startTime,
      maxTokens: 1024,
      isDeterministic: true,
      composability: {
        next_steps: ['/api/score', '/api/reflect'],
        recommended_action: 'Review your baseline assessment. Consider exploring deeper evaluations with /api/score or daily reflections with /api/reflect.',
      },
    })

    return NextResponse.json(envelope)
  } catch (error: unknown) {
    console.error('Baseline assessment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - check if user has a baseline and when retake is eligible
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  // Try V3 table first
  const { data: v3Data } = await supabaseAdmin
    .from('baseline_assessments_v3')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (v3Data) {
    const eligibleDate = new Date(v3Data.created_at)
    eligibleDate.setDate(eligibleDate.getDate() + RETAKE_INTERVAL_DAYS)

    return NextResponse.json({
      has_baseline: true,
      version: 'v3',
      baseline: v3Data,
      retake_eligible: new Date() >= eligibleDate,
      retake_eligible_date: eligibleDate.toISOString(),
    })
  }

  // V1 baseline table no longer checked — users with only V1 data
  // are treated as having no baseline and prompted to take the V3 assessment.
  return NextResponse.json({ has_baseline: false })
}
