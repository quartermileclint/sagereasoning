import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateApiKey, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { type ReasonDepth, EVALUATIVE_DISCLAIMER } from '@/lib/sage-reason-engine'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { type RetrieveResult } from '@/lib/rag'
import { loadLayer1WithFallback } from '@/lib/rag/load-layer1-with-fallback'
// M1-CP6 cutover (2026-05-08): translation-sandwich is the sole user-facing
// path. runSandwich sits AFTER the R20a perimeter (line 173 below). Per
// design choice 2A (parallel-run retired), bundled engine is no longer
// called from this route. Per ADR-004 §6 + §10 CP6 + AC4 + AC5 + AC8 + PR1 + PR6.
import { runSandwich } from '@/lib/translation-sandwich/parallel-run'
// M1-CP4e (2026-05-06) + M1-CP6 (2026-05-08): AC-13 Tier 1 force-clarification
// continuation-token mechanic. validateContinuationToken handles second-turn
// re-submission; issueContinuationToken (M1-CP6 design choice 3A) handles
// first-turn issuance when the sandwich emits a Tier 1 trigger. Token is a
// stateless HMAC signature — AC7 NOT engaged. Per ADR-008 §4 + AC4 + AC5 + PR6.
import {
  validateContinuationToken,
  issueContinuationToken,
  Tier1SecretMissingError,
} from '@/lib/translation-sandwich/tier1-token'

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

// =============================================================================
// A1 — Stage 1 Layer 2 plugin-auth scaffolding (PR1 single-endpoint proof)
// =============================================================================
//
// Status: Scaffolded behind feature flag set to off (2026-05-10).
// Per: /adopted/substrate-plugin-staging-plan.md Stage 1 item A1
//      /adopted/ADR-stoic-agent-substrate-concept.md (Decision §"The three layers")
//      D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10 (decision-log entry)
//
// This is the first execution-session work of the substrate-as-plugin build
// arc. /api/reason is the PR1 single-endpoint proof target — chosen because it
// is already on the translation-sandwich substrate per M1-CP6 (2026-05-08) and
// the existing dual-auth pattern (user-auth + API-key) is canonical here per
// KG4. The scaffold extends the dual-auth pattern with a third path
// (plugin-auth) without yet invoking it.
//
// Critical Change Protocol (project instructions §0c-ii) governs every change
// to this scaffold. PR6 applies (auth surface). AC7 applies (auth-surface
// change). The function is defined but NOT INVOKED. Until PLUGIN_AUTH_ENABLED
// is set to 'true' in the deployment environment AND a future code change
// inserts an invocation site, this scaffold has zero runtime effect.
//
// Deploy + flag-flip + verification sequence: NOT IN SCOPE FOR THIS SESSION.
// Per PR1, the proof is the flag-on verification on /api/reason; that happens
// in the subsequent session after Critical Change Protocol review of any
// post-scaffold-discovered risks. Approval requested in this session is for
// the scaffold commit only, not for deploy.
//
// Build-arc no-current-users governing note: only founder + test logins exist
// during the build arc; the Critical Change Protocol's "What happens to
// existing sessions?" step is moot for this scaffold and any subsequent
// flag-flip during the build arc. See /adopted/build-sessions-protocol-cache.md
// §"Founder governing notes for the duration of the build arc".

/**
 * Plugin-auth feature flag.
 *
 * When set to 'true' in the deployment environment, plugin-originated calls
 * to /api/reason MAY be authenticated via the X-Plugin-Auth header (subject
 * to a future code change wiring checkPluginAuth into the authentication
 * branch). Until both the flag is set AND an invocation site exists, this
 * scaffold has zero runtime effect.
 *
 * Default: 'false' (or unset, treated as false). The PLUGIN_AUTH_ENABLED
 * variable is documented in /website/.env.example.
 */
const PLUGIN_AUTH_ENABLED = process.env.PLUGIN_AUTH_ENABLED === 'true'

/**
 * Plugin-auth check (scaffold — NOT INVOKED in this session).
 *
 * Reads the X-Plugin-Auth header and performs a constant-time comparison
 * against PLUGIN_AUTH_SECRET. Returns valid=true with a placeholder plugin_id
 * on match; returns valid=false with a ready-to-send 401 NextResponse on any
 * failure (missing header, missing secret, secret mismatch, malformed input).
 *
 * Constant-time comparison is enforced via node:crypto's timingSafeEqual to
 * prevent timing-side-channel attacks against the secret.
 *
 * Fail-closed posture: if PLUGIN_AUTH_SECRET is missing or malformed, the
 * function returns 401 (not 503). This is deliberate — until the secret is
 * provisioned, plugin auth simply does not authenticate, which is the safe
 * default for an authentication function. The existing user-auth and API-key
 * paths are unaffected.
 *
 * AC7 standing constraint: this function does not touch the user session,
 * cookie scope, redirect behaviour, or domain configuration. It only inspects
 * the X-Plugin-Auth header and returns a result. AC7 NOT engaged at the
 * function level; AC7 ENGAGED at the eventual invocation-site change (when
 * checkPluginAuth is wired into the authentication branch in a future
 * session).
 *
 * The return shape mirrors validateApiKey for consistency with the existing
 * dual-auth pattern in security.ts.
 */
function checkPluginAuth(
  request: NextRequest
): { valid: true; plugin_id: string } | { valid: false; error: NextResponse } {
  const headerValue = request.headers.get('x-plugin-auth')

  if (!headerValue || typeof headerValue !== 'string' || headerValue.length === 0) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Plugin authentication required',
          message: 'Plugin-originated calls require an X-Plugin-Auth header.',
        },
        { status: 401, headers: corsHeaders() }
      ),
    }
  }

  const secret = process.env.PLUGIN_AUTH_SECRET

  if (!secret || typeof secret !== 'string' || secret.length === 0) {
    // Fail-closed: secret not provisioned. Return 401 (auth failure) rather
    // than 503 (server misconfigured) so plugin-auth simply does not
    // authenticate when the secret is absent. The existing user-auth and
    // API-key paths remain available.
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Plugin authentication unavailable' },
        { status: 401, headers: corsHeaders() }
      ),
    }
  }

  // Constant-time comparison. Both buffers must be the same length;
  // mismatched lengths fail without leaking the actual secret length.
  const headerBuf = Buffer.from(headerValue)
  const secretBuf = Buffer.from(secret)

  if (headerBuf.length !== secretBuf.length) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Plugin authentication failed' },
        { status: 401, headers: corsHeaders() }
      ),
    }
  }

  const match = timingSafeEqual(headerBuf, secretBuf)
  if (!match) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Plugin authentication failed' },
        { status: 401, headers: corsHeaders() }
      ),
    }
  }

  // Match. Return a placeholder plugin_id; future Stage 1 work will replace
  // this with a real identifier scheme (likely tied to signed plugin
  // metadata or a registered-plugin lookup).
  return { valid: true, plugin_id: 'scaffold-plugin' }
}

// Scaffold-presence assertions (zero runtime effect; references the feature
// flag and the function so that bundlers/linters do not tree-shake the
// scaffold out of the build before the eventual invocation site lands).
// Replace with the real invocation site in a future session once the
// Critical Change Protocol's deploy-phase review is complete.
void PLUGIN_AUTH_ENABLED
void checkPluginAuth

// =============================================================================
// END A1 scaffold
// =============================================================================

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
    // previousTrigger is integrated into the response meta below (Branch 3 — happy path)
    // when non-null. M1-CP6 cutover (2026-05-08) — was diagnostic-only during parallel-run;
    // is now load-bearing for second-turn meta logging.

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
    // M1-CP6 cutover (2026-05-08): translation-sandwich is the sole user-facing
    // path on /api/reason. Bundled engine no longer called from this route
    // (per ADR-004 §10 CP6 + design choice 2A — parallel-run retired).
    //
    // Failure isolation per ADR-004 §9 + design choice 1C:
    //   - Layer 1/2 throws → deterministic minimal fallback shape (200 status,
    //     fallback flag in meta). No bundled call.
    //   - Layer 3 LLM throw with fallback success → composed sandwich output
    //     with deterministic fallback prose (handled inside runSandwich).
    //   - Layer 3 LLM AND fallback both failing → deterministic minimal fallback.
    //
    // Tier 1 force-clarification surfacing per ADR-008 §2 + design choice 3A:
    //   When sandwich emits a Tier 1 trigger, the route issues the continuation
    //   token, splices it into the orchestrator's Tier 1 response shape, and
    //   returns to the user. First-turn surfacing.
    //
    // R20a perimeter at line 173 unchanged — runSandwich sits AFTER it.
    // AC4 + AC5 + AC8 + PR1 + PR6 preserved.
    // -------------------------------------------------------------------------

    const sandwichResult = await runSandwich({
      input,
      context,
      domain_context,
      urgency_context,
      stoicBrainContext: layer1.stoicBrainContext,
      retrievedPassages: layer1.retrievedPassages,
      practitionerContext,
      projectContext,
    })

    // Branch 1 — Tier 1 force-clarification fired (3A surfacing).
    if (sandwichResult.tier1_trigger !== null && sandwichResult.output) {
      let token: string
      try {
        token = issueContinuationToken(input, sandwichResult.tier1_trigger.trigger_code)
      } catch (err) {
        if (err instanceof Tier1SecretMissingError) {
          console.error(
            '[/api/reason] Tier 1 fired but TRANSLATION_SANDWICH_TIER1_SECRET unset; ' +
            'cannot issue continuation token. Set the env var per ADR-008 §4.2.'
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
        throw err  // outer catch returns 500
      }
      const tier1Output = sandwichResult.output as Record<string, unknown>
      tier1Output.continuation_token = token
      tier1Output.disclaimer = EVALUATIVE_DISCLAIMER
      return NextResponse.json(tier1Output, { headers: corsHeaders() })
    }

    // Branch 2 — Layer 1/2 throw OR Layer 3 LLM+fallback both failed (1C minimal fallback).
    if (
      sandwichResult.error === 'layer1_throw' ||
      sandwichResult.error === 'validation_throw' ||
      sandwichResult.error === 'layer3_throw'
    ) {
      return NextResponse.json(
        buildMinimalFallback(sandwichResult.error),
        { status: 200, headers: corsHeaders() }
      )
    }

    // Branch 3 — happy path: composed sandwich output. Add R3 disclaimer + previousTrigger meta.
    const output = sandwichResult.output as Record<string, unknown>
    output.disclaimer = EVALUATIVE_DISCLAIMER
    if (previousTrigger !== null) {
      const meta = (output.meta as Record<string, unknown>) ?? {}
      meta.previous_trigger = previousTrigger
      output.meta = meta
    }
    return NextResponse.json(output, { headers: corsHeaders() })
  } catch (error) {
    console.error('sage-reason API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * 1C deterministic minimal fallback shape (M1-CP6 design choice 1C, 2026-05-08).
 * Returned when Layer 1/2 throws or Layer 3 LLM AND deterministic fallback both fail.
 * Honest about the failure; no bundled call (parallel-run retired per 2A); structured
 * per ADR-004 §2.1 shape so consumers parsing the new schema don't break on null fields.
 *
 * R3 evaluative disclaimer included.
 */
function buildMinimalFallback(
  reason: 'layer1_throw' | 'validation_throw' | 'layer3_throw'
): Record<string, unknown> {
  return {
    version: 'translation-sandwich-v1',
    extraction: null,
    assessment: null,
    prose: {
      philosophical_reflection:
        'The reasoning engine could not complete an evaluation for this input. ' +
        'The framework itself is unaffected — the limitation is in this single processing run. ' +
        'Stoic practice asks us to engage with what is within our control: this temporary ' +
        'limitation is one such case.',
      improvement_guidance:
        'Please try again. If the issue persists, consider rephrasing the input or shortening it. ' +
        'Direct reflection or human counsel may also serve well — algorithmic analysis is one tool ' +
        'among several.',
      summary:
        'Evaluation unavailable for this run; the framework remains available on retry.',
    },
    meta: {
      engine_attribution: 'translation-sandwich',
      fallback: true,
      fallback_reason: reason,
    },
    disclaimer: EVALUATIVE_DISCLAIMER,
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
