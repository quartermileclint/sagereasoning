import { NextRequest, NextResponse } from 'next/server'
// #5 + #10 (P-GL): log prod errors + degrade honestly on an LLM outage.
import { isLlmOutage, llmOutageResponse } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import { supabaseAdmin } from '@/lib/supabase-server'
import { PROXIMITY_ENGLISH } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { MODEL_DEEP } from '@/lib/model-config'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { type RetrieveResult } from '@/lib/rag'
import { loadLayer1WithFallback } from '@/lib/rag/load-layer1-with-fallback'

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
 *
 * ---------------------------------------------------------------------------
 * CONTEXT LAYERS WIRED HERE:
 *   Layer 1 (Stoic Brain)        — Loaded via D6 + D7 RAG retrieval per
 *                                   Sub-session E4 (Pattern A2; same shape as
 *                                   /api/reason quick-depth from E1,
 *                                   /api/score standard-depth from E2, and
 *                                   /api/score-conversation deep-depth from E3).
 *                                   Passages passed to engine as structured
 *                                   `retrievedPassages`; engine builds the system
 *                                   block. If retrieval fails, falls back to the
 *                                   compiled-string path via getStoicBrainContext('standard').
 *   Layer 2 (Practitioner)       — getPractitionerContext(auth.user.id)
 *   Layer 3 (Project Context)    — getProjectContext('condensed')
 *   Loaded in parallel (Promise.all).
 *
 * WHY THIS SHAPE:
 *   Social-post evaluation benefits strongly from Layer 2 (this person's
 *   communication patterns) because social posting is habitual. Layer 3
 *   helps catch posts that contradict current project positioning or R19
 *   language rules.
 *
 * WHAT BREAKS IF CONTEXT CHANGES:
 *   - Layer 2 dropped → no personalisation; returning users get generic
 *     poster/reader splitting without history
 *   - Layer 3 dropped → no guard against posts that use prohibited R19
 *     language (e.g. "AI therapist") from being rated neutral
 *   - If D6/D7 retrieval throws, the route falls back to the compiled string
 *     path; the user sees a successful response (with the prior Layer 1 content)
 *     instead of a 500. Failure is logged via console.warn.
 *
 * SUB-SESSION E4 (2026-05-04 — D6/D7 wired into Layer 1 at standard depth, Pattern A2):
 *   - Per-request `Map<string, RetrieveResult>` cache declared inside POST
 *     handler (KG1 rule 4 — never module-level).
 *   - loadLayer1WithFallback imported from /lib/rag/load-layer1-with-fallback
 *     (the shared wrapper produced by Pattern S3 in E3; same module that
 *     /api/reason, /api/score, and /api/score-conversation use).
 *   - Retrieval failure (RetrievalUnavailableError, EmbeddingFailureError,
 *     RetrievalTimeoutError, or any thrown error) falls back to the compiled
 *     stoic-brain-loader path. Logged via console.warn for Phase-2 observation.
 *   - Group A second consumer wired (matches /api/score-conversation Pattern A2
 *     shape; shared substrate now serves four consumers with no duplication).
 *   - See: /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
 *   - See: /operations/decision-log.md D-SCORE-SOCIAL-RAG-WIRED-2026-05-04
 *
 * DESIGN DECISIONS DOCUMENTED IN:
 *   - operations/handoffs/session-7d-layer1-layer2.md  (L1/L2 origin)
 *   - operations/session-handoffs/2026-04-15-layer3-wiring.md  (L3 wired here)
 *   - operations/handoffs/founder/2026-05-04-sub-session-E3-close.md (PR1 rollout state)
 */

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

    // The MAXIMUM-length guard on `text` (provenance aeadbd1 2026-03-26, a
    // general security pass) used to sit HERE, before the distress check.
    // MOVED after the R20a redirect return on 2026-09-05 (Session 3B, Group 2
    // of operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-
    // ordering-AUDIT.md §6, item 8) under the binding ruling: "the distress
    // check runs before the length guard on any route where the human crisis
    // form is rendered." See the guard's new site below.

    // R20a — Vulnerable user detection (before any LLM call)
    // enforceDistressCheck() returns a SafetyGate — compile-time proof that
    // the distress classifier has been awaited before any reasoning proceeds.
    //
    // SCREENING CAP (2026-09-05, Session 3B Group 2, audit §3 constraint 2):
    // now that the maximum-length guard runs AFTER this check, the raw field
    // is unbounded here, so it is sliced at the route's own bound
    // (TEXT_LIMITS.medium — the same value the guard below enforces) before
    // the classifier sees it. An in-bound request is screened byte-identically
    // to before. DISCLOSED RESIDUAL (audit §4.3): distress appearing only past
    // character 5,000 is not screened — before this move it was not read at
    // all (a bare 400).
    const screenedText = text.slice(0, TEXT_LIMITS.medium)
    const gate = await enforceDistressCheck(detectDistressTwoStage(screenedText))
    if (gate.shouldRedirect) {
      return NextResponse.json(
        { distress_detected: true, severity: gate.result.severity, redirect_message: gate.result.redirect_message },
        { status: 200, headers: corsHeaders() }
      )
    }

    // `text` MAXIMUM length — MOVED here 2026-09-05 (Session 3B, Group 2 of
    // the perimeter-ordering audit, §6 item 8) under the 2026-09-06 ruling
    // (D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06). A long
    // distressed post now reaches the check above (capped at this same bound)
    // and receives the crisis resources instead of this 400. ORDER, NOT
    // EXISTENCE: value, message and status are unchanged, and the guard still
    // precedes the 2,000-char engine trim, every context/RAG load and the
    // engine. Pinned by MAX-1..4 in __tests__/r20a-invocation.test.ts on the
    // redirect block's brace-matched END; mutation-verified against both
    // bypasses and the cap's removal.
    const textErr = validateTextLength(text, 'text', TEXT_LIMITS.medium)
    if (textErr) {
      return NextResponse.json({ error: textErr }, { status: 400 })
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

    // Per-request cache for D6 retrievals (KG1 rule 4 — never module-level).
    const ragCache = new Map<string, RetrieveResult>()

    // Load Layer 1 (Stoic Brain via D6/D7 at standard depth), Layer 2 (practitioner
    // context), and Layer 3 (project context) in parallel to avoid sequential latency.
    const [layer1, practitionerContext, projectContext] = await Promise.all([
      loadLayer1WithFallback(trimmed, 'standard', ragCache, '/api/score-social'),
      getPractitionerContext(auth.user.id),
      getProjectContext('condensed'),
    ])

    // Call the shared reasoning engine. layer1 spreads into either
    // retrievedPassages (success path) or stoicBrainContext (fallback path).
    const reasoningResult = await runSageReason({
      input: trimmed,
      depth: 'standard',
      domain_context: domainContext,
      ...layer1,
      practitionerContext,
      projectContext,
      applyMirrorPrinciple: true, // R19d (D-R19D-ALL-TOOLS 2026-06-07)
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
        ai_model: MODEL_DEEP,
      },
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('Social score API error:', error)
    const outage = isLlmOutage(error)
    logRouteError({ route: '/api/score-social', method: 'POST', error, statusCode: outage ? 503 : 500, isLlmOutage: outage })
    if (outage) return llmOutageResponse()
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
