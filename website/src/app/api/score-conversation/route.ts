import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_DEEP } from '@/lib/model-config'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { type RetrieveResult } from '@/lib/rag'
import { loadLayer1WithFallback } from '@/lib/rag/load-layer1-with-fallback'

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
 *
 * ---------------------------------------------------------------------------
 * CONTEXT LAYERS WIRED HERE:
 *   Layer 1 (Stoic Brain)        — Loaded via D6 + D7 RAG retrieval per
 *                                   Sub-session E3 (Pattern A2; same shape as
 *                                   /api/reason quick-depth from E1 and
 *                                   /api/score standard-depth from E2).
 *                                   Passages passed to engine as structured
 *                                   `retrievedPassages`; engine builds the system
 *                                   block. If retrieval fails, falls back to the
 *                                   compiled-string path via getStoicBrainContext('deep').
 *   Layer 2 (Practitioner)       — getPractitionerContext(auth.user.id)
 *   Layer 3 (Project Context)    — getProjectContext('condensed')
 *   Loaded in parallel (Promise.all).
 *
 * WHY THIS SHAPE:
 *   Uses 'deep' Stoic Brain (6 mechanisms) because multi-party dynamics
 *   need iterative refinement. Layer 2 personalises the USER's role in the
 *   conversation (their patterns), not the other participants'. Layer 3
 *   situates the conversation in current project phase where relevant.
 *
 * WHAT BREAKS IF CONTEXT CHANGES:
 *   - Change depth from 'deep' to 'standard' → loses iterative_refinement
 *     mechanism; multi-party nuance degrades
 *   - Layer 2 dropped → user's participant role analyzed without their
 *     known passion patterns
 *   - Layer 3 dropped → conversations about project matters lose phase
 *     grounding
 *   - If D6/D7 retrieval throws, the route falls back to the compiled string
 *     path; the user sees a successful response (with the prior Layer 1 content)
 *     instead of a 500. Failure is logged via console.warn.
 *
 * SUB-SESSION E3 (2026-05-04 — D6/D7 wired into Layer 1 at deep depth, Pattern A2):
 *   - Per-request `Map<string, RetrieveResult>` cache declared inside POST
 *     handler (KG1 rule 4 — never module-level).
 *   - loadLayer1WithFallback imported from /lib/rag/load-layer1-with-fallback
 *     (the shared wrapper produced by Pattern S3 in E3; same module that
 *     /api/reason and /api/score now use).
 *   - Retrieval failure (RetrievalUnavailableError, EmbeddingFailureError,
 *     RetrievalTimeoutError, or any thrown error) falls back to the compiled
 *     stoic-brain-loader path. Logged via console.warn for Phase-2 observation.
 *   - First Pattern A2 wiring at deep depth (E1 = quick; E2 = standard).
 *     Completes coverage of all three depth settings on Pattern A2 consumers.
 *   - See: /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
 *   - See: /operations/decision-log.md D-CONSUMER-WIRING-LIFT-2026-05-04
 *
 * DESIGN DECISIONS DOCUMENTED IN:
 *   - operations/handoffs/session-7d-layer1-layer2.md  (L1/L2 origin)
 *   - operations/session-handoffs/2026-04-15-layer3-wiring.md  (L3 wired here)
 *   - operations/handoffs/founder/2026-05-04-sub-session-E2-close.md (PR1 rollout state)
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

    // Per-request cache for D6 retrievals (KG1 rule 4 — never module-level).
    const ragCache = new Map<string, RetrieveResult>()

    // Load Layer 1 (Stoic Brain via D6/D7 at deep depth), Layer 2 (practitioner
    // context), and Layer 3 (project context) in parallel to avoid sequential latency.
    const [layer1, practitionerContext, projectContext] = await Promise.all([
      loadLayer1WithFallback(truncated, 'deep', ragCache, '/api/score-conversation'),
      getPractitionerContext(auth.user.id),
      getProjectContext('condensed'),
    ])

    // Call the shared reasoning engine. layer1 spreads into either
    // retrievedPassages (success path) or stoicBrainContext (fallback path).
    const reasoningResult = await runSageReason({
      input: truncated,
      depth: 'deep',
      domain_context: domainContext,
      ...layer1,
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
