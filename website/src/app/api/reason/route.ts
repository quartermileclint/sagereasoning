import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateApiKey, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { runSageReason, type ReasonDepth } from '@/lib/sage-reason-engine'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { type RetrieveResult } from '@/lib/rag'
import { loadLayer1WithFallback } from '@/lib/rag/load-layer1-with-fallback'
// M1-CP4 (2026-05-04): translation-sandwich parallel-run orchestrator.
// Imported AFTER the R20a perimeter line below (line ~144). The orchestrator
// is invoked AFTER runSageReason returns (line ~184) and never throws.
// Per ADR-004 §6 + §6.3 + §10. Per AC4 + AC5 + AC8 + PR1 + PR6.
import { runParallelSandwich } from '@/lib/translation-sandwich/parallel-run'
// M1-CP4e (2026-05-06): AC-13 Tier 1 force-clarification continuation-token
// mechanic. Imported AFTER the R20a perimeter line below; token validation
// runs AFTER the distress check on every turn (per ADR-008 §6). The continuation
// token is a stateless HMAC signature, NOT a session credential — AC7 NOT
// engaged. Per ADR-008 §4 + AC4 + AC5 + PR6.
import { validateContinuationToken } from '@/lib/translation-sandwich/tier1-token'

// =============================================================================
// sage-reason — The Universal Reasoning Layer
//
// POST /api/reason
//
// Outcome: Run the Stoic core triad (or more) against any decision input.
//          Returns structured reasoning evaluation at the requested depth.
// Cost + Speed: 1 API call. ~2-4s depending on depth.
// Chains To: Any sage skill (as internal engine), any sage wrapper (as checkpoint).
//
// Depth parameter controls which mechanisms are applied:
//   quick    (3 mechanisms): Control Filter + Passion Diagnosis + Oikeiosis
//   standard (5 mechanisms): + Value Assessment + Appropriate Action
//   deep     (6 mechanisms): + Iterative Refinement
//
// The core triad (Control Filter + Passion Diagnosis + Oikeiosis) appears in
// 67% of all compliant original sage skills. sage-reason extracts this shared
// foundation so that skills become thin context templates on top of it.
//
// R3:  Disclaimer included in every response.
// R4:  System prompt is server-side only.
// R6a: Derived from V3 data files, not patched V1 structures.
// R6b: No independent virtue weights — unified assessment only.
// R6c: Qualitative proximity levels, not numeric 0-100.
// R6d: Passions are diagnostic (identifying false judgements), not punitive.
// R7:  All content traces to primary sources.
// R8a: API responses use Greek identifiers.
//
// -----------------------------------------------------------------------------
// CONTEXT LAYERS WIRED HERE (three-layer architecture):
//   Layer 1 (Stoic Brain):        Loaded via D6 + D7 RAG retrieval per Sub-session
//                                 E1 (Pattern A2). Passages are passed to the
//                                 engine as structured `retrievedPassages` (not
//                                 a pre-composed string). The engine builds the
//                                 system block from the passages.
//                                 If retrieval fails, falls back to the
//                                 compiled-string path via getStoicBrainContext(depth).
//   Layer 2 (Practitioner Context): Loaded only if auth.user.id is present
//                                 (authenticated session). Personalises reasoning
//                                 to this user's passions / virtues / proximity.
//                                 Set to null for API-key callers (agents).
//   Layer 3 (Project Context):    Always loaded at 'condensed' level. Adds
//                                 SageReasoning's current phase + recent decisions
//                                 so reasoning is situated, not abstract.
//   All three are loaded in parallel (Promise.all) to avoid sequential latency.
//
// WHY THIS SHAPE:
//   Context is loaded IN the route and passed AS PARAMS to runSageReason.
//   The engine injects into the correct slot of the system/user message — the
//   route never touches the prompt directly. This keeps context injection
//   logic in one place (the engine) while letting each endpoint choose which
//   layers and levels make sense for its audience.
//
// SUB-SESSION E1 (2026-05-04 — D6/D7 wired into Layer 1, Pattern A2):
//   - Per-request `Map<string, RetrieveResult>` cache declared inside POST
//     handler (KG1 rule 4 — never module-level).
//   - Retrieval failure (RetrievalUnavailableError, EmbeddingFailureError,
//     RetrievalTimeoutError, or any thrown error) falls back to the compiled
//     stoic-brain-loader path. Logged via console.warn for Phase-2 observation.
//   - See: /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
//   - See: /operations/decision-log.md D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04
//
// SUB-SESSION E3 (2026-05-04 — Pattern S2 + S3 helper-lift):
//   - loadLayer1WithFallback now imported from /lib/rag/load-layer1-with-fallback
//     (was a route-local function; lifted alongside the helpers in E3 because
//     three+ consumers now share the same wrapper).
//   - Mechanism-mapping helpers now imported from /lib/rag/helpers (was
//     ./helpers; the route-local file is removed in E3 since no other route
//     depends on it after the lift).
//   - Behaviour unchanged — pure relocation. No regression risk; harness re-run
//     proves Phases A/B/C still pass.
//   - See: /operations/decision-log.md D-CONSUMER-WIRING-LIFT-2026-05-04
//
// WHAT BREAKS IF CONTEXT LOADING CHANGES:
//   - If getProjectContext fails and returns a thrown error, the endpoint
//     returns a 500 for all users. Acceptable at single-user traffic; at scale
//     this should be wrapped in a try/catch with null fallback.
//   - If practitionerContext returns undefined (not null), the engine's
//     `if (params.practitionerContext)` check still works, but explicit null
//     is the documented contract.
//   - If project-context.json is missing at build time, the loader throws at
//     import — this endpoint (and all L3 endpoints) fail to start. Caught by
//     Vercel build — deploy would fail cleanly, not silently.
//   - If D6/D7 retrieval throws, the route falls back to the compiled string
//     path; the user sees a successful response (with the old Layer 1 content)
//     instead of a 500. Failure is logged.
//
// DESIGN DECISIONS DOCUMENTED IN:
//   - operations/handoffs/session-7d-layer1-layer2.md   (L1/L2 origin)
//   - operations/handoffs/session-7e-layer3-direct-endpoints.md  (L3 design)
//   - operations/session-handoffs/2026-04-15-layer3-wiring.md   (L3 wired here)
//   - operations/handoffs/founder/2026-05-04-sub-session-D-close.md (PR1 substrate)
//   - operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md (this wiring)
// =============================================================================

const VALID_DEPTHS: ReasonDepth[] = ['quick', 'standard', 'deep']

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  // Authentication: accept user session (JWT) OR API key
  const auth = await requireAuth(request)
  const apiKey = auth.error ? await validateApiKey(request, 'other') : null

  if (auth.error && (!apiKey || !apiKey.valid)) {
    return auth.error
  }

  try {
    const body = await request.json()
    // M1-CP4e (2026-05-06): continuation_token is optional, present on
    // second-turn re-submission after a Tier 1 force-clarification (per
    // ADR-008 §1 + §4). When present, it is validated AFTER the R20a
    // distress check (preserves perimeter on every turn per ADR-008 §6).
    const {
      input,
      context,
      depth: requestedDepth,
      domain_context,
      urgency_context,
      continuation_token,
    } = body

    // Validate required input
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input is required. Provide the decision, action, or situation to reason about.' },
        { status: 400 }
      )
    }

    // Validate text lengths
    const inputErr = validateTextLength(input, 'Input', TEXT_LIMITS.medium)
    if (inputErr) return NextResponse.json({ error: inputErr }, { status: 400 })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })
    const domainErr = validateTextLength(domain_context, 'Domain context', TEXT_LIMITS.medium)
    if (domainErr) return NextResponse.json({ error: domainErr }, { status: 400 })

    // R20a — Vulnerable user detection (before any LLM call)
    // enforceDistressCheck() returns a SafetyGate — compile-time proof that
    // the distress classifier has been awaited before any reasoning proceeds.
    //
    // M1-CP4e (2026-05-06): R20a runs on EVERY turn — including second-turn
    // re-submissions with a continuation_token. The augmented input on the
    // second turn is what gets distress-checked. The continuation token does
    // NOT bypass the perimeter (per ADR-008 §6). A second-turn distress fire
    // takes precedence over the token: the token is discarded; the practitioner
    // sees the redirect.
    const gate = await enforceDistressCheck(detectDistressTwoStage(input))
    if (gate.shouldRedirect) {
      return NextResponse.json(
        { distress_detected: true, severity: gate.result.severity, redirect_message: gate.result.redirect_message },
        { status: 200, headers: corsHeaders() }
      )
    }

    // M1-CP4e (2026-05-06): Continuation-token validation. Runs AFTER the
    // R20a perimeter and BEFORE the engine is called. Per ADR-008 §4.4 +
    // §5 step 3 + §6.
    //
    // When `continuation_token` is present, the request is a second-turn
    // re-submission after a Tier 1 force-clarification. The token is a
    // stateless HMAC signature (not a session credential — AC7 NOT engaged).
    // On any validation failure: return HTTP 400 with the specific error
    // code per ADR-008 §4.4. On success: extract `previous_trigger` for
    // downstream meta logging.
    //
    // When `continuation_token` is absent, the request is a fresh first-turn
    // request and validation is skipped.
    let previousTrigger: 'ELEMENT_FUSION' | 'SCOPE_AMBIGUITY' | 'TEMPORAL_AMBIGUITY' | null = null
    if (continuation_token !== undefined && continuation_token !== null) {
      const tokenResult = validateContinuationToken(continuation_token, input)
      if (!tokenResult.ok) {
        // Map error codes to HTTP responses per ADR-008 §4.4.
        if (tokenResult.error_code === 'continuation_token_secret_missing') {
          // The TRANSLATION_SANDWICH_TIER1_SECRET env var is not set on this
          // deployment. Fail-closed: the engine cannot validate tokens. Return
          // 503 (engine misconfigured) rather than 400 (client error) because
          // the client did everything right; the server is misconfigured.
          // This path should only fire pre-Sub-session-M1-CP4e-B (env var
          // provision); after that, the secret is always set.
          console.error(
            '[/api/reason] Tier 1 continuation token presented but ' +
              'TRANSLATION_SANDWICH_TIER1_SECRET is not set. The engine cannot ' +
              'validate the token. Set the env var per ADR-008 §4.2.'
          )
          return NextResponse.json(
            {
              error: 'continuation_token_engine_unavailable',
              detail:
                'Tier 1 force-clarification is not available on this deployment. ' +
                'Submit your input again as a fresh request.',
            },
            { status: 503, headers: corsHeaders() }
          )
        }
        // All other validation failures are 400.
        const errorBody: Record<string, unknown> = { error: tokenResult.error_code }
        if (tokenResult.error_code === 'continuation_token_expired' && tokenResult.expired_at !== undefined) {
          errorBody.expired_at = tokenResult.expired_at
        }
        return NextResponse.json(errorBody, { status: 400, headers: corsHeaders() })
      }
      // Token validated. Extract previous trigger code for meta logging.
      previousTrigger = tokenResult.payload.trigger_code
    }
    // previousTrigger is referenced in downstream meta logging at M1-CP6
    // cutover when the orchestrator becomes user-facing. During parallel-run
    // (M1-CP4e-A → M1-CP6), the user-facing path remains bundled-depth and
    // previousTrigger is preserved for diagnostic logging only.
    //
    // We reference the variable here to satisfy the TS no-unused-locals check
    // without semantic effect during parallel-run. Removable at cutover.
    void previousTrigger

    // Validate depth parameter
    const depth: ReasonDepth = requestedDepth || 'standard'
    if (!VALID_DEPTHS.includes(depth)) {
      return NextResponse.json(
        { error: `Invalid depth. Must be one of: ${VALID_DEPTHS.join(', ')}` },
        { status: 400 }
      )
    }

    // Per-request cache for D6 retrievals (KG1 rule 4 — never module-level).
    const ragCache = new Map<string, RetrieveResult>()

    // Load Layer 1 (Stoic Brain via D6/D7), Layer 2 (practitioner context), and
    // Layer 3 (project context) in parallel to avoid sequential latency.
    const [layer1, practitionerContext, projectContext] = await Promise.all([
      loadLayer1WithFallback(input, depth, ragCache, '/api/reason'),
      auth.user?.id ? getPractitionerContext(auth.user.id) : Promise.resolve(null),
      getProjectContext('condensed'),
    ])

    // -------------------------------------------------------------------------
    // M1-CP4 (2026-05-04, refactored to concurrent execution post-close):
    // Translation-sandwich parallel-run.
    // Per ADR-004 §6.1 (parallel-run shape) + §6.3 (failure isolation).
    //
    // CONCURRENT EXECUTION MODEL:
    //   runSageReason and runParallelSandwich fire concurrently. Both promises
    //   are awaited; total user-facing latency = max(bundled, sandwich).
    //   No deadline cutoff during the M1-CP4-CP5 testing window — per founder
    //   directive: testing-period observations should not be artificially
    //   pre-empted before realistic latencies are known.
    //
    // FAILURE ISOLATION (preserved):
    //   runParallelSandwich never throws (errors caught internally; logged to
    //   console.warn). If runSageReason throws, the outer try/catch returns
    //   500 to the user; the sandwich's outcome is logged to console.warn but
    //   no comparison row is written (table requires bundled_depth_output to
    //   be non-null).
    //
    // ACTIVATION:
    //   Gated on env TRANSLATION_SANDWICH_PARALLEL_RUN=1 inside the
    //   orchestrator module (read once at module load). When unset/"0", the
    //   sandwich is a no-op and only bundled-depth runs.
    //
    // R20a PERIMETER PRESERVATION:
    //   runSageReason + runParallelSandwich both sit AFTER line-144 distress
    //   check. Phase 7 of the harness asserts: distress-check before any
    //   reasoning call. AC4 + AC5 + PR6.
    // -------------------------------------------------------------------------

    // Call the shared reasoning engine. layer1 spreads into either
    // retrievedPassages (success path) or stoicBrainContext (fallback path).
    const bundledStartedAt = Date.now()
    const bundledPromise = runSageReason({
      input,
      context,
      depth,
      domain_context,
      urgency_context,
      ...layer1,
      practitionerContext,
      projectContext,
    })

    // Fire the parallel sandwich concurrently with bundled-depth.
    // Awaiting it ensures user response waits until both have settled (no
    // fire-and-forget — KG1 rule 2). The function never throws.
    await runParallelSandwich({
      input,
      context,
      domain_context,
      urgency_context,
      stoicBrainContext: layer1.stoicBrainContext,
      retrievedPassages: layer1.retrievedPassages,
      practitionerContext,
      projectContext,
      bundledDepthPromise: bundledPromise,
      bundledStartedAt,
    })

    // Extract the bundled result. By this point the promise has already
    // settled (runParallelSandwich awaited it internally). If runSageReason
    // threw, this re-throws and the outer catch returns 500.
    const result = await bundledPromise

    return NextResponse.json(result, { headers: corsHeaders() })
  } catch (error) {
    console.error('sage-reason API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
