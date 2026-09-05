import { NextRequest, NextResponse } from 'next/server'
// #5 + #10 (P-GL): log prod errors + degrade honestly on an LLM outage.
import { isLlmOutage, llmOutageResponse } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
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
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'
import {
  isScoreConversationR20aEnabled,
  composeConversationDistressSubject,
  escalateMildDistress,
  buildMildSupportResources,
  type MildSupportResources,
} from '@/lib/score-conversation-r20a'

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
 * R20a (2026-07-07, Foundation Completion Session 2): the two-stage distress
 * check runs over the submitted free text (conversation + context + format,
 * each field capped at 15,000 chars) before any context load or LLM call,
 * FLAG-GATED behind SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED (default OFF ⇒
 * byte-identical). Moderate/acute → human-audience crisis redirect; stage-1
 * mild → the mild-escalation check (stage 2 runs anyway, more severe wins);
 * final mild → additive `support_resources` fold, evaluation proceeds.
 * Closes the S8b 0h-exit blocker (c) (the S8a "inside-perimeter exception").
 * Helpers + recorded elections: src/lib/score-conversation-r20a.ts.
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
    // `format` is length-validated too — but AFTER the R20a block, not here.
    // See the ruled ordering note at that guard's new site below.
    // (`conversation` and `context` above still precede the block; that is the
    // inherited posture the 2026-09-06 ruling routed to the perimeter-wide
    // audit — operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-
    // ordering-AUDIT.md §6 Group 2, item 7 — NOT an endorsement of it.)
    //
    // PRESENCE/TYPE only. The `conversation` MINIMUM-length check that used to
    // share this `if` (`.trim().length < 20`, provenance 496d832 2026-03-23)
    // was SPLIT OFF and MOVED after the R20a block on 2026-09-05 (Session 3,
    // audit §6 Group 1, item 1). This half stays: a missing or non-string field
    // carries no text of its own to screen, and it keeps a non-string from
    // reaching `.trim()` below. The message is kept identical on both halves.
    if (!conversation || typeof conversation !== 'string') {
      return NextResponse.json(
        { error: 'conversation is required (min 20 characters). Paste a chat transcript, email thread, or meeting notes.' },
        { status: 400 }
      )
    }

    // ------------------------------------------------------------------------
    // R20a — Vulnerable user detection (before any context load or LLM call).
    //
    // Foundation Completion Session 2 (2026-07-07): closes the S8b 0h-exit
    // blocker (c) — this was the last human-facing free-text route with no
    // distress check (the S8a "inside-perimeter exception",
    // D-S8A-OPEN-DECISIONS-2026-06-10 decision 2).
    //
    // FLAG-GATED behind SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED (default
    // OFF). When UNSET, this entire block is skipped — no classifier call, no
    // added latency, no wire-shape change. Activation is a founder-walked
    // Critical step (flag + redeploy + live smoke); rollback = unset the flag.
    //
    // CORRECTED 2026-09-05 (PR19 fold): this previously said flag-off made the
    // ROUTE "byte-identical to pre-wiring behaviour". That is a claim about
    // this BLOCK, and it is no longer true of the route — the always-on
    // `format` length check sits outside this flag (BELOW, since the
    // 2026-09-06 move — see that guard's own comment), so unsetting the flag
    // does NOT restore pre-wiring behaviour for a >15,000-char `format`.
    // Reverting that requires reverting the code. The distinction matters
    // because it is the documented rollback path of a Critical activation.
    //
    // The check subject is the submitted free text (conversation + context +
    // format), each field capped at 15,000 chars (TEXT_LIMITS.long posture)
    // — see score-conversation-r20a.ts for the recorded elections + the
    // adversarial-review folds. The 6000-word truncation below is engine-only.
    //
    // On moderate/acute → the HUMAN-audience crisis rendering (this is a
    // human tool route; cookie-session auth only — never the developer-form
    // payload). On a stage-1 'mild' → the mild-escalation check (the shared
    // stage-2 evaluator runs anyway; the more severe result wins, never a
    // downgrade — review finding F3: a third party's mild language in the
    // pasted transcript must not mute the Haiku look at the submitter's own
    // regex-missed distress). On (final) mild → proceed, with the crisis
    // resources folded into the result as the additive `support_resources`
    // field. Stage-2 (Haiku) outage fails open WITH alert + marker row per
    // ADR-R20a-01 D6-c inside detectDistressTwoStage (and fail-open-to-mild
    // inside escalateMildDistress); the stage-1 regex floor always runs.
    //
    // Rules served: R20a; AC2 (~500ms borderline latency accepted); AC4
    // (invocation-tested); AC5 (eleventh route-level perimeter entry — the
    // mandated `await enforceDistressCheck(detectDistressTwoStage(...))`
    // pattern); PR3 (awaited, never fire-and-forget); PR6 (Critical); PR15
    // (reuses the shared classifier + renderer; nothing re-implemented).
    // ------------------------------------------------------------------------
    let mildSupportResources: MildSupportResources | undefined
    if (isScoreConversationR20aEnabled()) {
      const distressSubject = composeConversationDistressSubject({ conversation, context, format })
      const gate = await enforceDistressCheck(detectDistressTwoStage(distressSubject))
      let effectiveDistress = gate.result
      if (!gate.shouldRedirect && gate.result.severity === 'mild') {
        effectiveDistress = await escalateMildDistress(distressSubject, gate.result)
      }
      if (effectiveDistress.redirect_message !== null) {
        return NextResponse.json(
          renderR20aRedirectResponse({
            audience: 'human_user',
            severity: effectiveDistress.severity,
            redirect_message: effectiveDistress.redirect_message,
          }),
          { status: 200, headers: corsHeaders() }
        )
      }
      if (effectiveDistress.severity === 'mild') {
        mildSupportResources = buildMildSupportResources()
      }
    }

    // ------------------------------------------------------------------------
    // `conversation` MINIMUM length — MOVED here 2026-09-05 (Session 3, Group 1
    // of operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-
    // AUDIT.md §6, item 1) under the same ruling as the `format` guard below.
    // This was the ruling's paradigm harm on the ruled route: "I want to die."
    // is 14 characters, and until this move it 400'd before the R20a block
    // ran. ORDER, NOT EXISTENCE: the guard stays, the value stays, and it still
    // precedes `truncated`, `domainContext` and the engine. Its presence/type
    // half stayed above (a missing field has no text to screen). Pinned by
    // FV-7a–d in the route battery on the block's brace-matched END,
    // mutation-verified against a guard placed inside the block both before
    // AND after the check. Provenance of the original: 496d832 (2026-03-23) —
    // NOT aeadbd1, as an earlier comment here said; corrected at the audit
    // (§4.7). Disclosed residual, not fixed here: a short input the check reads
    // as MILD proceeds past the block and then 400s here, so the mild support
    // resources are not delivered on that path (mild is not the crisis form;
    // the ruling does not reach it) — named in the Session 3 close.
    // ------------------------------------------------------------------------
    if (conversation.trim().length < 20) {
      return NextResponse.json(
        { error: 'conversation is required (min 20 characters). Paste a chat transcript, email thread, or meeting notes.' },
        { status: 400 }
      )
    }

    // ------------------------------------------------------------------------
    // `format` length validation — DELIBERATELY PLACED AFTER THE R20a BLOCK.
    //
    // MOVED 2026-09-06 under the mentor ruling recorded at
    // operations/count-discipline-2026-09/2026-09-06-mentor-ruling-r20a-length-
    // guard-ordering-verbatim.md, adopted as
    // D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06:
    //
    //   "Purpose (b) governs for human-facing members of the perimeter. The
    //    distress check runs before the length guard on any route where the
    //    human crisis form is rendered."
    //
    // This route renders the HUMAN crisis form (audience: 'human_user', above),
    // so it is a human-facing member and the ruling binds it.
    //
    // WHY NOT SIMPLY DELETE THE GUARD. The ruling is about ORDER, not existence
    // -- "the distress check runs BEFORE the length guard" presupposes a guard.
    // Reverting the guard entirely would satisfy the ruling's crisis-redirect
    // purpose while reopening the defect it was added to close (below), so the
    // guard is MOVED, not removed.
    //
    // WHY THE GUARD EXISTS AT ALL. composeConversationDistressSubject TRUNCATES
    // each field at DISTRESS_SUBJECT_FIELD_CAP, while this route appends the
    // FULL `format` to domainContext, which sage-reason-engine forwards to the
    // model untruncated. Without this check, text past the cap reached the
    // ENGINE having never reached the CLASSIFIER. This guard still precedes
    // domainContext construction below, so that direction remains closed.
    //
    // WHAT THE MOVE COSTS, and why the ruling accepts it. An oversized `format`
    // now reaches the classifier rather than being rejected first. PER-REQUEST
    // INPUT SIZE is bounded, not open-ended: the composer slices every
    // screened field to DISTRESS_SUBJECT_FIELD_CAP before the classifier sees
    // it, so the Haiku call's input is capped regardless of submitted size.
    // CALL FREQUENCY does rise, disclosed rather than folded into "bounded"
    // (2026-09-06 PR19 fold, review 2 F4): a request class that previously
    // 400'd at zero model cost now always reaches stage 1, and on a
    // non-hit unconditionally reaches stage 2 (Haiku) -- one call for a
    // class that was previously free. Governed by the existing per-route
    // rate limit (RATE_LIMITS.scoring), not by this guard. The ruling
    // accepted the cost in any case -- a bare 400 to a distressed person
    // "is not a cost in the engineering sense. It is a harm."
    //
    // WHAT IT BUYS. An oversized `format` carrying distress in its first 15,000
    // characters now receives the crisis redirect instead of a bare 400.
    //
    // WHAT IT DOES NOT BUY, disclosed rather than omitted (2026-09-06 PR19
    // fold, review 1 F4). The composer still slices `format` at
    // DISTRESS_SUBJECT_FIELD_CAP before the classifier sees it (below the
    // guard's own 400 threshold, so this is now a REAL truncation, not the
    // no-op it was pre-move -- see the corrected DISTRESS_SUBJECT_FIELD_CAP
    // docstring in score-conversation-r20a.ts). Distress appearing ONLY past
    // character 15,000 of `format` still reaches neither the classifier nor
    // the engine: the ruled harm, relocated to a narrower input class rather
    // than eliminated. Named for the perimeter-wide audit, not fixed here --
    // fixing it would mean not rejecting an oversized `format` at all, which
    // is the engine-leak this guard exists to prevent.
    //
    // SCOPE at the 2026-09-06 move: only this guard moved then, and THREE
    // other guards preceded the block at that time. UPDATED 2026-09-05
    // (Session 3, Group 1 of the perimeter-ordering audit): the `conversation`
    // MIN-length check (<20) has now ALSO moved — it sits immediately above
    // this comment block, after the R20a block. Its provenance was 496d832
    // (2026-03-23), NOT aeadbd1 as this comment previously said (corrected at
    // the audit, §4.7). TWO guards still precede the block:
    //   - `conversation` MAX-length (~line 111) and `context` MAX-length
    //     (~line 117) — both landed 2026-03-26 (aeadbd1) in a general
    //     security pass, before any perimeter existed here. Routed to the
    //     audit's §6 Group 2 (item 7), where a screening cap rides the move.
    // This guard was movable on 2026-09-06 because its provenance is clean --
    // it landed 2026-09-05 (4c1cd94) and merely followed the route's existing
    // posture rather than choosing it; the others waited for the audit
    // (execution-order analysis, not textual position), which has now run.
    //
    // ORDERING IS PINNED, not merely commented -- and the pin itself was
    // WRONG on first cut, found independently by all three PR19 reviewers of
    // this move (HIGH, folded 2026-09-06): it anchored on the block's OPENING
    // (`isScoreConversationR20aEnabled()`), so a guard placed INSIDE the flag
    // block, before enforceDistressCheck itself, passed the battery green --
    // the exact harm this move exists to prevent. Fixed by anchoring on the
    // block's own closing brace (matched from its opening, not from any one
    // call inside it) in FV-6a. An unpinned -- or wrongly-pinned -- ordering
    // is exactly how the pre-ruling one arrived and persisted unexamined.
    //
    // BREAKING CHANGE, status/shape unchanged by the move, MESSAGE not
    // (2026-09-06 PR19 fold, review 2 F3): a STRING `format` longer than
    // TEXT_LIMITS.long still 400s in either flag state, with the same
    // `{error: string}` shape. But a request with BOTH a short `conversation`
    // (<20 chars) AND an oversized `format` now 400s on the conversation
    // guard first (it precedes this one), not the format guard -- the error
    // MESSAGE differs from before the move on that input class, though the
    // status code does not. No in-repo caller is affected (mentor-hub sends
    // `conversation` alone); an external API consumer is.
    //
    // FV-2 in the battery IMPORTS the composer's SCREENED_FIELDS rather than
    // parsing it: every field the composer screens must be length-bounded here.
    // ------------------------------------------------------------------------
    if (format && typeof format === 'string' && format.length > TEXT_LIMITS.long) {
      return NextResponse.json(
        { error: `format exceeds maximum length of ${TEXT_LIMITS.long} characters` },
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
      applyMirrorPrinciple: true, // R19d (D-R19D-ALL-TOOLS 2026-06-07)
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
      // R20a mild fold — additive; present ONLY when the flag is on AND the
      // check returned severity 'mild' (flag-off and benign inputs are
      // byte-identical: the spread of an absent field adds nothing).
      ...(mildSupportResources !== undefined ? { support_resources: mildSupportResources } : {}),
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
    const outage = isLlmOutage(error)
    logRouteError({ route: '/api/score-conversation', method: 'POST', error, statusCode: outage ? 503 : 500, isLlmOutage: outage })
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
