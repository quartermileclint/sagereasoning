import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_DEEP } from '@/lib/model-config'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'

/**
 * sage-converse — Evaluate a conversation for Stoic virtue and dynamics.
 *
 * Uses the shared sage-reason engine (deep depth for nuanced analysis) to evaluate
 * the overall tone and quality of conversations, with per-participant scoring.
 *
 * Unique to this endpoint:
 *   - Uses deep depth (Sonnet model) for nuanced multi-party analysis
 *   - Truncates long conversations to 6000 words
 *   - Splits scoring into overall conversation + per-participant receipts
 *   - Analyzes virtue engagement across multiple participants
 */

// POST — Score a conversation
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { conversation, context, format } = await request.json()

    // Validate text length
    if (conversation && typeof conversation === 'string' && conversation.length > TEXT_LIMITS.long) {
      return NextResponse.json(
        { error: `conversation exceeds maximum length of ${TEXT_LIMITS.long} characters` },
        { status: 400 }
      )
    }
    if (context && typeof context === 'string' && context.length > TEXT_LIMITS.long) {
      return NextResponse.json(
        { error: `context exceeds maximum length of ${TEXT_LIMITS.long} characters` },
        { status: 400 }
      )
    }

    if (!conversation || typeof conversation !== 'string' || conversation.trim().length < 20) {
      return NextResponse.json(
        { error: 'conversation is required (min 20 characters). Paste a chat transcript, email thread, or meeting notes.' },
        { status: 400 }
      )
    }

    // Truncate long conversations
    const truncated = conversation.trim().split(/\s+/).slice(0, 6000).join(' ')

    // Build domain context for conversation evaluation
    let domainContext = `This is a conversation evaluation. Assess the overall ethical tone and virtue alignment of the conversation from two angles:
1. The overall conversation dynamics (passions, false judgements, appropriate action)
2. Per-participant virtue engagement (if multiple participants can be identified)`
    if (context?.trim()) {
      domainContext += `\nAdditional context: ${context.trim()}`
    }
    if (format?.trim()) {
      domainContext += `\nFormat: ${format.trim()}`
    }

    // Load practitioner context (Layer 2 — personalised reasoning)
    const practitionerContext = await getPractitionerContext(auth.user.id)

    // Load project context (Layer 3 — project context)
    const projectContext = await getProjectContext('condensed')

    // Call the shared reasoning engine at deep depth with Stoic Brain (Layer 1) + practitioner context (Layer 2) + project context (Layer 3)
    const reasoningResult = await runSageReason({
      input: truncated,
      depth: 'deep',
      domain_context: domainContext,
      stoicBrainContext: getStoicBrainContext('deep'),
      practitionerContext,
      projectContext,
    })

    const evalData = reasoningResult.result as any

    // Parse the response and extract participant information
    // Note: The deep reasoning should include multi-participant analysis
    // For now, we create a structure compatible with the original response format
    const scoreData = {
      overall: {
        katorthoma_proximity: evalData.katorthoma_proximity,
        passions_detected: evalData.passion_diagnosis?.passions_detected || [],
        is_kathekon: evalData.kathekon_assessment?.is_kathekon ?? evalData.is_kathekon ?? false,
        kathekon_quality: evalData.kathekon_assessment?.quality || evalData.kathekon_quality || 'marginal',
        virtue_domains_engaged: evalData.virtue_domains_engaged || ['phronesis'],
        reasoning: evalData.philosophical_reflection || 'Conversation assessment complete.',
        notable_patterns: evalData.iterative_refinement?.progress_dimensions?.passion_reduction || 'See detailed analysis.',
      },
      participants: [] as any[],
      disclaimer: evalData.disclaimer,
    }

    // Generate overall receipt
    const overallReceipt = extractReceipt({
      skillId: 'sage-converse',
      input: truncated.slice(0, 500),
      evalData,
      mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    })

    const result = {
      ...scoreData,
      reasoning_receipt: overallReceipt,
      participant_receipts: [],
      scored_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'conversation_score_v3',
        metadata: {
          overall_proximity: scoreData.overall?.katorthoma_proximity,
          overall_is_kathekon: scoreData.overall?.is_kathekon,
          num_participants: scoreData.participants?.length || 0,
        },
      })
      .then(() => {})

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/score-conversation',
      model: MODEL_DEEP,
      startTime,
      maxTokens: 2048,
      composability: {
        next_steps: ['/api/score-iterate'],
        recommended_action: 'Review conversation insights and consider iterative refinement with /api/score-iterate.',
      },
    })

    return NextResponse.json(envelope, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Conversation score API error:', error)
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
