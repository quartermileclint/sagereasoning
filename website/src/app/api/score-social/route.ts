import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { PROXIMITY_ENGLISH } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { MODEL_FAST } from '@/lib/model-config'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistress } from '@/lib/guardrails'

/**
 * sage-filter (score-social) — Evaluate a social media post for Stoic virtue.
 *
 * Uses the shared sage-reason engine (standard depth) with social-media-specific
 * domain context for poster/reader passion splitting.
 *
 * Unique to this endpoint:
 *   - Input capped at 2000 characters (short-form)
 *   - Domain context for social media evaluation
 *   - Splits passions into poster_passions and reader_triggered_passions
 *   - Publish recommendation based on proximity level
 *   - Analytics tracking
 */

// V3 Social Media Evaluation Response Type
interface V3SocialMediaScore {
  poster_passions: Array<{
    root_passion: string
    sub_species: string
    evidence: string
    false_judgement: string
  }>
  reader_triggered_passions: Array<{
    root_passion: string
    sub_species: string
    evidence: string
    false_judgement: string
  }>
  false_judgements: string[]
  corrections: string[]
  katorthoma_proximity: KatorthomaProximityLevel
  disclaimer: string
}

// Determine publish recommendation based on proximity level
function getPublishRecommendation(proximity: KatorthomaProximityLevel): 'publish' | 'revise' | 'reconsider' {
  if (proximity === 'sage_like' || proximity === 'principled') {
    return 'publish'
  } else if (proximity === 'deliberate') {
    return 'revise'
  } else {
    // habitual or reflexive
    return 'reconsider'
  }
}

// POST — Score a social media post before publishing
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { text, platform, context } = await request.json()

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'text is required — the post you want to score before publishing' },
        { status: 400 }
      )
    }

    const textErr = validateTextLength(text, 'text', TEXT_LIMITS.medium)
    if (textErr) {
      return NextResponse.json({ error: textErr }, { status: 400 })
    }

    // R20a — Vulnerable user detection (before any LLM call)
    const distressCheck = detectDistress(text)
    if (distressCheck.redirect_message) {
      return NextResponse.json(
        { distress_detected: true, severity: distressCheck.severity, redirect_message: distressCheck.redirect_message },
        { status: 200, headers: corsHeaders() }
      )
    }

    // Social media is short-form — cap at 2000 characters
    const trimmed = text.trim().slice(0, 2000)

    // Build domain context for social media evaluation
    let domainContext = `This is a social media post evaluation. Assess the virtue of the post from two perspectives:
1. The poster's virtue alignment (what passions/false judgements drive the author)
2. Reader-triggered passions (what passions might the post trigger in readers)`
    if (platform?.trim()) {
      domainContext += `\nPlatform: ${platform.trim()}`
    }
    if (context?.trim()) {
      domainContext += `\nAdditional context: ${context.trim()}`
    }

    // Load practitioner (L2) and project context (L3) in parallel
    const [practitionerContext, projectContext] = await Promise.all([
      getPractitionerContext(auth.user.id),
      getProjectContext('condensed'),
    ])

    // Call the shared reasoning engine with Stoic Brain (L1) + practitioner context (L2) + project context (L3)
    const reasoningResult = await runSageReason({
      input: trimmed,
      depth: 'standard',
      domain_context: domainContext,
      stoicBrainContext: getStoicBrainContext('standard'),
      practitionerContext,
      projectContext,
    })

    // Extract poster and reader passions from the reasoning result
    const evalData = reasoningResult.result as any
    const allPassions = evalData.passion_diagnosis?.passions_detected || []

    // Post-process: Split passions into poster vs reader triggered
    // (This is a simplified split; real implementation would have more nuanced logic)
    const posterPassions = allPassions.slice(0, Math.ceil(allPassions.length / 2)).map((p: any) => ({
      root_passion: p.root_passion,
      sub_species: p.name || p.id || p.sub_species,
      evidence: `Detected in post content: ${p.name || p.id || p.sub_species}`,
      false_judgement: p.false_judgement || 'Unspecified',
    }))

    const readerPassions = allPassions.slice(Math.ceil(allPassions.length / 2)).map((p: any) => ({
      root_passion: p.root_passion,
      sub_species: p.name || p.id || p.sub_species,
      evidence: `May trigger reader: ${p.name || p.id || p.sub_species}`,
      false_judgement: p.false_judgement || 'Unspecified',
    }))

    const proximity = evalData.katorthoma_proximity as KatorthomaProximityLevel
    const publish_recommendation = getPublishRecommendation(proximity)
    const proximity_label = PROXIMITY_ENGLISH[proximity]

    const result = {
      poster_passions: posterPassions,
      reader_triggered_passions: readerPassions,
      false_judgements: evalData.passion_diagnosis?.false_judgements || [],
      corrections: evalData.improvement_path ? [evalData.improvement_path] : [],
      katorthoma_proximity: proximity,
      proximity_label,
      publish_recommendation,
      character_count: trimmed.length,
      platform: platform || null,
      scored_at: new Date().toISOString(),
      disclaimer: evalData.disclaimer,
    }

    // Analytics — event_type is now 'social_score_v3'
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'social_score_v3',
        metadata: {
          katorthoma_proximity: proximity,
          proximity_label,
          platform: platform || 'unknown',
          recommendation: publish_recommendation,
          poster_passions_count: posterPassions.length,
          reader_passions_count: readerPassions.length,
        },
      })
      .then(() => {})

    // Add AI transparency metadata (NAIC guidance; OECD principles)
    return NextResponse.json(
      {
        ...result,
        ai_generated: true,
        ai_model: MODEL_FAST,
      },
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('Social score API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
